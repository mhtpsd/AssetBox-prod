import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../../services/storage/storage.service';
import { SearchService, AssetDocument } from '../search/search.service';
import { EmailService } from '../../services/email/email.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

    constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly email: EmailService,
    private readonly notifications:  NotificationsService,
    private readonly search: SearchService,
  ) {}

  /**
   * Get pending assets for review
   */
  async getPendingAssets(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.asset.findMany({
        where: {
          status: 'PENDING',
          deletedAt: null,
        },
        include: {
          files: {
            where: { fileType: 'THUMBNAIL' },
            take: 1,
          },
          proofs: {
            where: { status: 'PENDING' },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          owner: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.asset.count({
        where: {
          status: 'PENDING',
          deletedAt: null,
        },
      }),
    ]);

    const assets = items.map((asset) => ({
      id: asset.id,
      title: asset.title,
      description: asset.description,
      assetType: asset.assetType,
      category: asset.category,
      price: Number(asset.price),
      thumbnailUrl: asset.files[0]?.fileUrl
        ? this.storage.getPublicUrl(asset.files[0]. fileUrl)
        : null,
      proof: asset.proofs[0]
        ? {
            id: asset.proofs[0].id,
            type: asset.proofs[0]. proofType,
            data: asset.proofs[0]. proofData,
          }
        : null,
      owner: asset.owner,
      createdAt: asset.createdAt,
    }));

    return {
      items: assets,
      total,
      page,
      limit,
      totalPages: Math. ceil(total / limit),
    };
  }

  /**
   * Get single asset for review
   */
  async getAssetForReview(assetId: string) {
    const asset = await this.prisma. asset.findUnique({
      where: { id: assetId },
      include: {
        files: true,
        proofs: {
          orderBy: { createdAt: 'desc' },
        },
        owner: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
          },
        },
      },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    return {
      id: asset.id,
      title: asset.title,
      description: asset.description,
      assetType: asset.assetType,
      category: asset.category,
      subcategory: asset.subcategory,
      tags: asset.tags,
      licenseType: asset.licenseType,
      price: Number(asset.price),
      status: asset.status,
      files: asset.files. map((f) => ({
        id: f.id,
        type: f.fileType,
        url: 
          f.fileType === 'ORIGINAL'
            ? null
            : this.storage.getPublicUrl(f.fileUrl),
        size: Number(f.fileSize),
        format: f.fileFormat,
      })),
      proofs: asset.proofs.map((p) => ({
        id: p. id,
        type: p. proofType,
        data:  p.proofData,
        status: p.status,
        adminNote: p.adminNote,
        createdAt: p.createdAt,
      })),
      owner: asset.owner,
      createdAt: asset.createdAt,
    };
  }

  /**
   * Approve asset
   */
    /**
   * Approve asset
   */
  async approveAsset(assetId: string, adminNote?:  string) {
    const asset = await this.prisma.asset.findUnique({
      where: { id: assetId },
      include: {
        owner: true,
        files: {
          where: { fileType: 'THUMBNAIL' },
          take: 1,
        },
        proofs: {
          where: { status: 'PENDING' },
          take: 1,
        },
      },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    // Update asset and proof in transaction
    await this.prisma.$transaction([
      this.prisma.asset.update({
        where: { id: assetId },
        data: { status: 'APPROVED' },
      }),
      ...(asset.proofs[0]
        ? [
            this.prisma.assetProof.update({
              where: { id: asset.proofs[0].id },
              data: {
                status: 'APPROVED',
                adminNote: adminNote || 'Approved',
              },
            }),
          ]
        : []),
    ]);

    // Index in Meilisearch
    const searchDocument: AssetDocument = {
      id: asset.id,
      title: asset.title,
      description: asset.description,
      assetType: asset.assetType,
      category: asset.category,
      subcategory: asset.subcategory || undefined,
      tags: asset.tags,
      price: Number(asset.price),
      licenseType: asset.licenseType,
      ownerId: asset.ownerId,
      ownerUsername: asset.owner.username || '',
      thumbnailUrl: asset.files[0]?.fileUrl
        ? this.storage.getPublicUrl(asset.files[0].fileUrl)
        : undefined,
      totalDownloads: asset.totalDownloads,
      viewCount: asset.viewCount,
      createdAt: asset.createdAt.getTime(),
    };

    await this.search.indexAsset(searchDocument);

    // Send notification
    await this.notifications.create({
      userId: asset.ownerId,
      type: 'ASSET_APPROVED',
      title: 'Asset Approved!  ✅',
      message:  `Your asset "${asset.title}" has been approved and is now live.`,
      data: {
        assetId: asset.id,
        assetTitle: asset.title,
      },
    });

    // Send email
    await this.email.sendAssetApproved(
      asset.owner.email,
      asset.title,
      asset.id,
    );

    this.logger.log(`Asset approved and indexed: ${assetId}`);

    return { success: true };
  }

  /**
   * Reject asset
   */
    /**
   * Reject asset
   */
  async rejectAsset(assetId: string, reason: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { id: assetId },
      include: {
        owner: true,
        proofs:  {
          where: { status:  'PENDING' },
          take: 1,
        },
      },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    // Update asset and proof in transaction
    await this.prisma.$transaction([
      this.prisma.asset.update({
        where: { id:  assetId },
        data:  { status: 'REJECTED' },
      }),
      ...(asset.proofs[0]
        ? [
            this.prisma.assetProof.update({
              where: { id:  asset.proofs[0].id },
              data: {
                status: 'REJECTED',
                adminNote: reason,
              },
            }),
          ]
        : []),
    ]);

    // Remove from search index if it was previously approved
    await this.search.removeAsset(assetId);

    // Send notification
    await this.notifications.create({
      userId: asset.ownerId,
      type: 'ASSET_REJECTED',
      title:  'Asset Needs Changes',
      message: `Your asset "${asset.title}" needs changes. Check the details.`,
      data: {
        assetId: asset.id,
        assetTitle: asset.title,
        reason,
      },
    });

    // Send email
    await this.email.sendAssetRejected(
      asset.owner.email,
      asset.title,
      asset.id,
      reason,
    );

    this.logger.log(`Asset rejected: ${assetId}`);

    return { success: true };
  }

  /**
   * Get pending payouts
   */
  async getPendingPayouts(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this. prisma.payoutRequest.findMany({
        where: { status: 'PENDING' },
        include: {
          user:  {
            select: {
              id: true,
              name:  true,
              username: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.payoutRequest.count({
        where: { status: 'PENDING' },
      }),
    ]);

    const payouts = items.map((p) => ({
      id: p.id,
      amount: Number(p.amount),
      status: p.status,
      user: p.user,
      createdAt: p.createdAt,
    }));

    return {
      items: payouts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Process payout (mark as paid)
   */
  async processPayout(payoutId: string) {
    const payout = await this.prisma.payoutRequest.findUnique({
      where: { id: payoutId },
      include: { user: true },
    });

    if (!payout) {
      throw new NotFoundException('Payout request not found');
    }

    if (payout.status !== 'PENDING') {
      throw new NotFoundException('Payout has already been processed');
    }

    // Update payout status
    await this.prisma.payoutRequest.update({
      where: { id: payoutId },
      data: {
        status: 'PAID',
        processedAt: new Date(),
      },
    });

    // Send notification
    await this.notifications.create({
      userId: payout.userId,
      type: 'PAYOUT_PROCESSED',
      title: 'Payout Sent!  💰',
      message: `Your payout of $${Number(payout.amount).toFixed(2)} has been sent.`,
      data: {
        payoutId: payout.id,
        amount: Number(payout.amount),
      },
    });

    // Send email
    await this.email.sendPayoutProcessed(
      payout.user.email,
      Number(payout.amount),
    );

    this.logger.log(`Payout processed: ${payoutId}`);

    return { success: true };
  }

  /**
   * Reject payout
   */
  async rejectPayout(payoutId: string, reason: string) {
    const payout = await this.prisma.payoutRequest. findUnique({
      where:  { id: payoutId },
      include: { user: true },
    });

    if (!payout) {
      throw new NotFoundException('Payout request not found');
    }

    if (payout.status !== 'PENDING') {
      throw new NotFoundException('Payout has already been processed');
    }

    // Update payout and refund wallet in transaction
    await this.prisma.$transaction([
      this.prisma.payoutRequest.update({
        where: { id: payoutId },
        data: {
          status: 'REJECTED',
          adminNote: reason,
        },
      }),
      // Refund to wallet
      this.prisma.user.update({
        where: { id: payout.userId },
        data: {
          walletBalance: { increment: payout.amount },
        },
      }),
    ]);

    // Send notification
    await this. notifications.create({
      userId: payout.userId,
      type: 'SYSTEM',
      title: 'Payout Request Update',
      message: `Your payout request was not processed. The amount has been returned to your wallet.`,
      data: {
        payoutId:  payout.id,
        amount: Number(payout.amount),
        reason,
      },
    });

    // Send email
    await this.email.sendPayoutRejected(
      payout. user.email,
      Number(payout.amount),
      reason,
    );

    this.logger.log(`Payout rejected: ${payoutId}`);

    return { success: true };
  }

  /**
   * Get admin dashboard stats
   */
  async getStats() {
    const [
      pendingAssets,
      pendingPayouts,
      totalUsers,
      totalAssets,
      totalRevenue,
    ] = await Promise.all([
      this.prisma.asset.count({
        where: { status: 'PENDING', deletedAt: null },
      }),
      this.prisma. payoutRequest.count({
        where: { status: 'PENDING' },
      }),
      this.prisma.user.count(),
      this.prisma.asset.count({
        where: { status: 'APPROVED', deletedAt: null },
      }),
      this.prisma. order.aggregate({
        where: { paymentStatus: 'PAID' },
        _sum: { totalAmount: true },
      }),
    ]);

    return {
      pendingAssets,
      pendingPayouts,
      totalUsers,
      totalAssets,
      totalRevenue:  Number(totalRevenue._sum.totalAmount || 0),
    };
  }
}