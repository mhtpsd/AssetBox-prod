import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WalletService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Get wallet balance
   */
  async getBalance(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        walletBalance: true,
        paymentVerified: true,
      },
    });

    return {
      balance: Number(user?. walletBalance || 0),
      paymentVerified: user?.paymentVerified || false,
    };
  }

  /**
   * Get earnings history
   */
  async getEarnings(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.earning.findMany({
        where: { userId },
        include: {
          asset: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.earning.count({ where: { userId } }),
    ]);

    const earnings = items.map((e) => ({
      id: e.id,
      amount: Number(e.amount),
      platformFee: Number(e.platformFee),
      createdAt: e.createdAt,
      asset: e.asset,
    }));

    return {
      items: earnings,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Request payout
   */
  async requestPayout(userId: string, amount: number) {
    // Get user wallet
    const user = await this. prisma.user.findUnique({
      where: { id:  userId },
      select: {
        walletBalance: true,
        paymentVerified: true,
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (! user.paymentVerified) {
      throw new ForbiddenException(
        'Please verify your payment information before requesting a payout',
      );
    }

    const balance = Number(user.walletBalance);
    const minimumPayout = this.config.get<number>('platform.minimumPayoutAmount') || 0;

    if (amount < minimumPayout) {
      throw new BadRequestException(
        `Minimum payout amount is $${minimumPayout}`,
      );
    }

    if (amount > balance) {
      throw new BadRequestException('Insufficient balance');
    }

    // Check for pending payouts
    const pendingPayout = await this.prisma. payoutRequest.findFirst({
      where: {
        userId,
        status:  'PENDING',
      },
    });

    if (pendingPayout) {
      throw new BadRequestException(
        'You already have a pending payout request',
      );
    }

    // Create payout request and update wallet in transaction
    const payout = await this.prisma.$transaction(async (tx) => {
      // Create payout request
      const newPayout = await tx.payoutRequest.create({
        data: {
          userId,
          amount,
          status: 'PENDING',
        },
      });

      // Deduct from wallet
      await tx.user.update({
        where: { id:  userId },
        data: {
          walletBalance: { decrement: amount },
        },
      });

      // Create notification
      await tx.notification.create({
        data: {
          userId,
          type: 'SYSTEM',
          title: 'Payout Requested',
          message: `Your payout request of $${amount. toFixed(2)} is being processed.`,
          data: {
            payoutId: newPayout.id,
            amount,
          },
        },
      });

      return newPayout;
    });

    return {
      id: payout.id,
      amount: Number(payout.amount),
      status: payout.status,
      createdAt: payout.createdAt,
    };
  }

  /**
   * Get payout history
   */
  async getPayouts(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this. prisma.payoutRequest.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma. payoutRequest.count({ where: { userId } }),
    ]);

    const payouts = items. map((p) => ({
      id: p.id,
      amount: Number(p.amount),
      status: p.status,
      adminNote: p.adminNote,
      processedAt: p.processedAt,
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
   * Get earnings stats
   */
  async getStats(userId: string) {
    const [totalEarnings, totalSales, pendingPayouts] = await Promise. all([
      this.prisma.earning.aggregate({
        where: { userId },
        _sum: { amount: true },
      }),
      this.prisma. earning.count({ where: { userId } }),
      this.prisma. payoutRequest.aggregate({
        where: { userId, status: 'PENDING' },
        _sum: { amount: true },
      }),
    ]);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { walletBalance: true },
    });

    return {
      totalEarnings: Number(totalEarnings._sum.amount || 0),
      totalSales,
      currentBalance: Number(user?.walletBalance || 0),
      pendingPayouts: Number(pendingPayouts._sum.amount || 0),
    };
  }
}