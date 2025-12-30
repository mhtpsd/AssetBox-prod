import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../../services/storage/storage.service';

@Injectable()
export class DownloadsService {
  private readonly logger = new Logger(DownloadsService.name);

  constructor(
    private readonly prisma:  PrismaService,
    private readonly storage: StorageService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Generate download URL for asset
   */
  async generateDownloadUrl(
    userId: string,
    assetId: string,
    ipAddress: string,
    userAgent: string,
  ) {
    // Get asset
    const asset = await this.prisma.asset.findUnique({
      where: { id: assetId, deletedAt: null },
      include: {
        files: {
          where: { fileType: 'ORIGINAL' },
        },
      },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    // Check ownership or purchase
    const isOwner = asset.ownerId === userId;
    const isFree = Number(asset.price) === 0;

    let ownership: any = null;
    if (!isOwner && !isFree) {
      ownership = await this.prisma.userAsset.findUnique({
        where: {
          userId_assetId: {
            userId,
            assetId,
          },
        },
      });

      if (!ownership) {
        throw new ForbiddenException('You must purchase this asset to download it');
      }
    }

    const originalFile = asset.files[0];
    if (!originalFile) {
      throw new NotFoundException('Asset file not found');
    }

    // Generate signed URL (15 minutes expiry)
    const expiresIn = this.config.get<number>('platform.downloadLinkExpiry') || 900;
    const signedUrl = await this.storage.getSignedUrl(originalFile.fileUrl, expiresIn);

    // Log download
    const transactionOperations: any[] = [
      this.prisma.downloadLog.create({
        data: {
          userId,
          assetId,
          ipAddress,
          userAgent: userAgent || 'Unknown',
        },
      }),
    ];

    // Update download count if user owns it
    if (ownership && ownership.id) {
      transactionOperations.push(
        this.prisma.userAsset.update({
          where: { id: ownership.id },
          data: { downloadedCount: { increment: 1 } },
        })
      );
    }

    await this.prisma.$transaction(transactionOperations);

    this.logger.log(`Download URL generated for asset ${assetId} by user ${userId}`);

    return {
      url: signedUrl,
      filename: `${asset.title}.${originalFile.fileFormat}`,
      expiresIn,
      expiresAt: new Date(Date.now() + expiresIn * 1000),
    };
  }

  /**
   * Get user's purchased assets
   */
  async getMyAssets(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.userAsset.findMany({
        where: { userId },
        include: {
          asset: {
            include: {
              files: {
                where:  { fileType: 'THUMBNAIL' },
                take: 1,
              },
              owner: {
                select: {
                  username: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma. userAsset.count({ where: { userId } }),
    ]);

    const assets = items.map((item) => ({
      id: item.asset.id,
      title: item.asset.title,
      assetType: item.asset.assetType,
      category: item.asset.category,
      price: Number(item.asset.price),
      downloadedCount: item.downloadedCount,
      purchasedAt: item.createdAt,
      thumbnailUrl: item.asset.files[0]?.fileUrl
        ? this.storage.getPublicUrl(item.asset.files[0].fileUrl)
        : null,
      owner: {
        username: item.asset. owner.username,
      },
    }));

    return {
      items: assets,
      total,
      page,
      limit,
      totalPages: Math. ceil(total / limit),
    };
  }
}