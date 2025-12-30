import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../../services/storage/storage.service';
import {
  CreateAssetDto,
  UpdateAssetDto,
  SubmitAssetDto,
  QueryAssetsDto,
} from './dto';

@Injectable()
export class AssetsService {
  private readonly logger = new Logger(AssetsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    @InjectQueue('media') private readonly mediaQueue: Queue,
  ) {}

  /**
   * Create a new asset with files
   */
  async create(
    userId: string,
    dto: CreateAssetDto,
    files: Express. Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one file is required');
    }

    // Upload files to storage
    const uploadedFiles = await Promise.all(
      files.map(async (file) => {
        const result = await this.storage.upload(
          file.buffer,
          file. originalname,
          dto.assetType,
          { folder: 'assets/originals' },
        );

        return {
          fileType: 'ORIGINAL' as const,
          fileUrl: result.key,
          fileSize: BigInt(result.size),
          fileFormat: file.originalname.split('.').pop()?. toLowerCase() || '',
          mimeType: result.mimeType,
        };
      }),
    );

    // Create asset with files
    const asset = await this.prisma.asset.create({
      data:  {
        ownerId: userId,
        title: dto.title,
        description: dto.description,
        assetType: dto. assetType,
        category: dto. category,
        subcategory: dto. subcategory,
        tags: dto. tags || [],
        licenseType: dto. licenseType || 'STANDARD',
        price: dto.price,
        status: 'DRAFT',
        files:  {
          create:  uploadedFiles,
        },
      },
      include: {
        files: true,
        owner: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
      },
    });

    // Queue thumbnail/preview generation
    await this.mediaQueue. add(
      'generate-preview',
      {
        assetId:  asset.id,
        assetType: dto. assetType,
        files: uploadedFiles. map((f) => ({
          key: f.fileUrl,
          mimeType: f. mimeType,
        })),
      },
      {
        attempts: 3,
        backoff:  {
          type:  'exponential',
          delay: 1000,
        },
      },
    );

    this.logger.log(`Asset created:  ${asset.id} by user ${userId}`);

    return this.formatAsset(asset);
  }

  /**
   * Get asset by ID
   */
  async findById(id: string, userId?:  string) {
    const asset = await this. prisma.asset. findUnique({
      where: { id, deletedAt: null },
      include: {
        files: true,
        proofs: userId
          ? {
              where: { asset: { ownerId: userId } },
              select: {
                id: true,
                proofType: true,
                status: true,
                adminNote: true,
                createdAt: true,
              },
            }
          :  false,
        owner: {
          select: {
            id: true,
            name: true,
            username: true,
            image:  true,
          },
        },
        _count: {
          select: {
            orderItems: {
              where: { order: { paymentStatus: 'PAID' } },
            },
          },
        },
      },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    // Check access for non-approved assets
    if (asset.status !== 'APPROVED' && asset. ownerId !== userId) {
      throw new NotFoundException('Asset not found');
    }

    // Increment view count (only for approved assets, non-owners)
    if (asset.status === 'APPROVED' && asset.ownerId !== userId) {
      await this.prisma.asset.update({
        where: { id },
        data: { viewCount: { increment: 1 } },
      });
    }

    return this.formatAsset(asset);
  }

  /**
   * Get user's own assets
   */
  async findMyAssets(userId:  string, query:  QueryAssetsDto) {
    const { status, assetType, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where:  any = {
      ownerId: userId,
      deletedAt: null,
    };

    if (status) {
      where.status = status;
    }

    if (assetType) {
      where.assetType = assetType;
    }

    const [items, total] = await Promise.all([
      this.prisma.asset.findMany({
        where,
        include: {
          files: {
            where: { fileType: 'THUMBNAIL' },
            take: 1,
          },
          _count: {
            select: {
              orderItems: {
                where: { order: { paymentStatus: 'PAID' } },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.asset.count({ where }),
    ]);

    const assets = items.map((asset) => ({
      id: asset.id,
      title: asset.title,
      assetType: asset. assetType,
      category: asset. category,
      price: Number(asset.price),
      status: asset.status,
      viewCount: asset. viewCount,
      totalDownloads: asset. totalDownloads,
      totalSales: asset._count.orderItems,
      thumbnailUrl: asset. files[0]?.fileUrl
        ? this.storage.getPublicUrl(asset. files[0].fileUrl)
        : null,
      createdAt: asset.createdAt,
      updatedAt: asset.updatedAt,
    }));

    return {
      items: assets,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Update asset (only owner, only draft/rejected)
   */
  async update(
    userId: string,
    assetId: string,
    dto: UpdateAssetDto,
    newFiles?:  Express.Multer.File[],
  ) {
    const asset = await this.prisma.asset.findUnique({
      where: { id:  assetId, deletedAt: null },
      include: { files: true },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    if (asset. ownerId !== userId) {
      throw new ForbiddenException('You can only edit your own assets');
    }

    if (! ['DRAFT', 'REJECTED'].includes(asset.status)) {
      throw new BadRequestException(
        'Can only edit assets in draft or rejected status',
      );
    }

    // Handle new file uploads
    let newUploadedFiles: any[] = [];
    if (newFiles && newFiles.length > 0) {
      // Delete old original files from storage
      const oldOriginals = asset.files.filter((f) => f.fileType === 'ORIGINAL');
      for (const file of oldOriginals) {
        await this.storage.delete(file. fileUrl);
      }

      // Delete old files from database
      await this.prisma.assetFile.deleteMany({
        where:  { assetId, fileType: 'ORIGINAL' },
      });

      // Upload new files
      const assetType = dto.assetType || asset.assetType;
      newUploadedFiles = await Promise.all(
        newFiles. map(async (file) => {
          const result = await this.storage.upload(
            file.buffer,
            file. originalname,
            assetType,
            { folder: 'assets/originals' },
          );

          return {
            fileType: 'ORIGINAL' as const,
            fileUrl: result.key,
            fileSize: BigInt(result.size),
            fileFormat: file. originalname.split('. ').pop()?.toLowerCase() || '',
            mimeType: result.mimeType,
          };
        }),
      );
    }

    // Update asset
    const updated = await this.prisma.asset.update({
      where:  { id: assetId },
      data: {
        title: dto.title,
        description: dto.description,
        assetType: dto.assetType,
        category: dto.category,
        subcategory: dto.subcategory,
        tags: dto.tags,
        licenseType: dto.licenseType,
        price: dto.price,
        ...(newUploadedFiles.length > 0 && {
          files: {
            create: newUploadedFiles,
          },
        }),
      },
      include:  {
        files:  true,
        owner: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
      },
    });

    // Queue new preview generation if files changed
    if (newUploadedFiles. length > 0) {
      // Delete old thumbnails/previews
      await this.prisma.assetFile.deleteMany({
        where: {
          assetId,
          fileType: { in: ['THUMBNAIL', 'PREVIEW'] },
        },
      });

      await this.mediaQueue. add('generate-preview', {
        assetId:  updated.id,
        assetType:  updated.assetType,
        files: newUploadedFiles. map((f) => ({
          key:  f.fileUrl,
          mimeType: f.mimeType,
        })),
      });
    }

    return this.formatAsset(updated);
  }

  /**
   * Submit asset for review
   */
  async submit(userId: string, assetId: string, dto: SubmitAssetDto) {
    const asset = await this.prisma. asset.findUnique({
      where:  { id: assetId, deletedAt: null },
      include: { proofs: true, files: true },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    if (asset. ownerId !== userId) {
      throw new ForbiddenException('You can only submit your own assets');
    }

    if (!['DRAFT', 'REJECTED']. includes(asset.status)) {
      throw new BadRequestException('Asset cannot be submitted in current status');
    }

    // Validate asset has required files
    const hasOriginal = asset.files. some((f) => f.fileType === 'ORIGINAL');
    if (!hasOriginal) {
      throw new BadRequestException('Asset must have at least one file');
    }

    // Create proof record
    await this.prisma. assetProof.create({
      data:  {
        assetId,
        proofType: dto. proofType,
        proofData:  dto.proofData,
        status: 'PENDING',
      },
    });

    // Update asset status
    const updated = await this. prisma.asset. update({
      where: { id: assetId },
      data: { status: 'PENDING' },
      include: {
        files: true,
        proofs: true,
        owner: {
          select: {
            id: true,
            name: true,
            username: true,
            image:  true,
          },
        },
      },
    });

    this.logger.log(`Asset submitted for review: ${assetId}`);

    return this.formatAsset(updated);
  }

  /**
   * Delete asset (soft delete)
   */
  async delete(userId: string, assetId: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { id:  assetId, deletedAt: null },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    if (asset.ownerId !== userId) {
      throw new ForbiddenException('You can only delete your own assets');
    }

    // Check if asset has been sold
    const hasSales = await this.prisma.orderItem.count({
      where:  {
        assetId,
        order: { paymentStatus: 'PAID' },
      },
    });

    if (hasSales > 0) {
      // Soft delete - mark as removed but keep for buyers
      await this. prisma.asset.update({
        where: { id:  assetId },
        data: {
          status: 'REMOVED',
          deletedAt: new Date(),
        },
      });
    } else {
      // Hard delete - remove files and record
      const files = await this.prisma.assetFile.findMany({
        where: { assetId },
      });

      // Delete files from storage
      for (const file of files) {
        await this.storage.delete(file.fileUrl);
        if (file.fileType !== 'ORIGINAL') {
          await this.storage.delete(file. fileUrl, true); // Public bucket
        }
      }

      // Delete from database
      await this.prisma.asset.delete({
        where: { id: assetId },
      });
    }

    this.logger.log(`Asset deleted: ${assetId} by user ${userId}`);

    return { success: true };
  }

  /**
   * Get asset versions
   */
  async getVersions(userId: string, assetId: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { id: assetId, deletedAt: null },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    if (asset.ownerId !== userId) {
      throw new ForbiddenException('You can only view versions of your own assets');
    }

    const versions = await this.prisma. assetVersion.findMany({
      where: { assetId },
      orderBy: { version: 'desc' },
    });

    return versions. map((v) => ({
      ... v,
      fileSize: Number(v.fileSize),
    }));
  }

  /**
   * Format asset for response
   */
  private formatAsset(asset:  any) {
    const thumbnailFile = asset.files?. find((f:  any) => f.fileType === 'THUMBNAIL');
    const previewFile = asset.files?.find((f: any) => f.fileType === 'PREVIEW');
    const originalFiles = asset.files?. filter((f: any) => f.fileType === 'ORIGINAL') || [];

    return {
      id:  asset.id,
      title: asset. title,
      description: asset.description,
      assetType: asset.assetType,
      category: asset.category,
      subcategory: asset.subcategory,
      tags: asset.tags,
      licenseType: asset.licenseType,
      price: Number(asset.price),
      status: asset.status,
      viewCount: asset. viewCount,
      totalDownloads:  asset. totalDownloads,
      totalSales: asset._count?. orderItems || 0,
      thumbnailUrl: thumbnailFile
        ? this.storage.getPublicUrl(thumbnailFile. fileUrl)
        : null,
      previewUrl: previewFile
        ?  this.storage.getPublicUrl(previewFile.fileUrl)
        : null,
      files: originalFiles. map((f: any) => ({
        id: f.id,
        fileFormat: f.fileFormat,
        fileSize: Number(f.fileSize),
        mimeType: f. mimeType,
      })),
      proofs: asset.proofs || [],
      owner: asset.owner,
      createdAt: asset.createdAt,
      updatedAt: asset.updatedAt,
    };
  }
}