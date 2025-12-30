import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../../services/storage/storage.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage:  StorageService,
  ) {}

  /**
   * Get user's orders
   */
  async getUserOrders(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise. all([
      this.prisma.order.findMany({
        where: { userId },
        include: {
          items: {
            include: {
              asset:  {
                include: {
                  files: {
                    where: { fileType: 'THUMBNAIL' },
                    take:  1,
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma. order.count({ where: { userId } }),
    ]);

    const formattedOrders = orders.map((order) => ({
      id: order.id,
      totalAmount: Number(order.totalAmount),
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      items: order.items.map((item) => ({
        id: item.id,
        price: Number(item.price),
        asset: {
          id: item. asset.id,
          title: item.asset.title,
          assetType: item.asset.assetType,
          thumbnailUrl: item.asset.files[0]?.fileUrl
            ? this.storage.getPublicUrl(item.asset.files[0].fileUrl)
            : null,
        },
      })),
    }));

    return {
      items: formattedOrders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get single order
   */
  async getOrder(userId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
      include: {
        items: {
          include: {
            asset: {
              include: {
                files:  {
                  where: { fileType: 'THUMBNAIL' },
                  take: 1,
                },
                owner: {
                  select:  {
                    username: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return {
      id: order.id,
      totalAmount: Number(order.totalAmount),
      paymentStatus: order.paymentStatus,
      stripePaymentId: order.stripePaymentId,
      createdAt: order.createdAt,
      items: order.items.map((item) => ({
        id: item.id,
        price: Number(item.price),
        asset: {
          id: item. asset.id,
          title: item.asset.title,
          assetType: item.asset. assetType,
          category: item.asset.category,
          thumbnailUrl: item.asset.files[0]?.fileUrl
            ? this.storage.getPublicUrl(item.asset. files[0].fileUrl)
            : null,
          owner: {
            username: item.asset.owner.username,
          },
        },
      })),
    };
  }
}