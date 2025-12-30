import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find user by ID
   */
  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        image: true,
        bio: true,
        isAdmin: true,
        paymentVerified: true,
        walletBalance: true,
        acceptedTermsAt: true,
        createdAt:  true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Find user by username (public profile)
   */
  async findByUsername(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        name:  true,
        username: true,
        image: true,
        bio: true,
        createdAt: true,
        _count: {
          select: {
            assets: {
              where: { status: 'APPROVED', deletedAt: null },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      ... user,
      totalAssets: user._count.assets,
      _count: undefined,
    };
  }

  /**
   * Get user's public assets
   */
  async getUserAssets(username: string, page = 1, limit = 20) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.asset.findMany({
        where:  {
          ownerId: user. id,
          status: 'APPROVED',
          deletedAt: null,
        },
        select: {
          id: true,
          title: true,
          price: true,
          assetType: true,
          category: true,
          totalDownloads: true,
          viewCount: true,
          createdAt: true,
          files: {
            where: { fileType: 'THUMBNAIL' },
            select: { fileUrl: true },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take:  limit,
      }),
      this.prisma.asset.count({
        where:  {
          ownerId: user.id,
          status:  'APPROVED',
          deletedAt: null,
        },
      }),
    ]);

    const assets = items.map((asset) => ({
      ...asset,
      price: Number(asset.price),
      thumbnailUrl: asset. files[0]?.fileUrl || null,
      files: undefined,
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
   * Update user profile
   */
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    // Check username uniqueness if changing
    if (dto. username) {
      const existing = await this.prisma.user.findFirst({
        where:  {
          username: dto.username,
          id: { not: userId },
        },
      });

      if (existing) {
        throw new ConflictException('Username already taken');
      }

      // Validate username format
      if (!/^[a-zA-Z0-9_-]{3,30}$/.test(dto.username)) {
        throw new BadRequestException(
          'Username must be 3-30 characters and contain only letters, numbers, underscores, and hyphens',
        );
      }
    }

    const user = await this.prisma. user.update({
      where:  { id: userId },
      data: {
        name: dto.name,
        username: dto.username,
        bio: dto.bio,
        image: dto.image,
      },
      select: {
        id: true,
        name: true,
        username: true,
        email:  true,
        image: true,
        bio: true,
        isAdmin: true,
        paymentVerified: true,
        walletBalance: true,
        createdAt: true,
      },
    });

    return user;
  }

  /**
   * Accept terms of service
   */
  async acceptTerms(userId: string) {
    return this.prisma. user.update({
      where: { id: userId },
      data: { acceptedTermsAt: new Date() },
      select: {
        id: true,
        acceptedTermsAt:  true,
      },
    });
  }

  /**
   * Get user statistics (for dashboard)
   */
  async getUserStats(userId: string) {
    const [
      totalAssets,
      pendingAssets,
      approvedAssets,
      totalSales,
      totalEarnings,
      pendingPayouts,
      totalDownloads,
    ] = await Promise. all([
      // Total assets
      this. prisma.asset. count({
        where: { ownerId: userId, deletedAt: null },
      }),
      // Pending assets
      this.prisma.asset.count({
        where: { ownerId: userId, status: 'PENDING', deletedAt:  null },
      }),
      // Approved assets
      this. prisma.asset. count({
        where: { ownerId: userId, status:  'APPROVED', deletedAt: null },
      }),
      // Total sales (order items for user's assets)
      this.prisma.orderItem.count({
        where: {
          asset: { ownerId: userId },
          order: { paymentStatus: 'PAID' },
        },
      }),
      // Total earnings
      this.prisma. earning.aggregate({
        where:  { userId },
        _sum: { amount: true },
      }),
      // Pending payouts
      this. prisma.payoutRequest.aggregate({
        where:  { userId, status: 'PENDING' },
        _sum: { amount: true },
      }),
      // Total downloads
      this.prisma.asset.aggregate({
        where: { ownerId: userId, deletedAt: null },
        _sum: { totalDownloads: true },
      }),
    ]);

    // Get wallet balance
    const user = await this.prisma.user.findUnique({
      where: { id:  userId },
      select: { walletBalance: true },
    });

    return {
      totalAssets,
      pendingAssets,
      approvedAssets,
      totalSales,
      totalEarnings:  Number(totalEarnings._sum. amount || 0),
      pendingPayouts:  Number(pendingPayouts._sum.amount || 0),
      totalDownloads:  totalDownloads._sum.totalDownloads || 0,
      walletBalance: Number(user?.walletBalance || 0),
    };
  }

  /**
   * Get user's recent earnings
   */
  async getRecentEarnings(userId: string, days = 30) {
    const startDate = new Date();
    startDate. setDate(startDate.getDate() - days);

    const earnings = await this.prisma.earning.findMany({
      where: {
        userId,
        createdAt: { gte: startDate },
      },
      select: {
        id: true,
        amount: true,
        platformFee: true,
        createdAt: true,
        asset: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return earnings. map((e) => ({
      ...e,
      amount: Number(e.amount),
      platformFee: Number(e.platformFee),
    }));
  }
}