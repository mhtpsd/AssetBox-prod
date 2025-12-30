import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../../services/storage/storage.service';

@Injectable()
export class CartService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  /**
   * Get or create user's cart
   */
  async getOrCreateCart(userId: string) {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            asset: {
              include: {
                files: {
                  where: { fileType: 'THUMBNAIL' },
                  take: 1,
                },
                owner: {
                  select:  {
                    id: true,
                    username: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include:  {
              asset: {
                include: {
                  files:  {
                    where: { fileType: 'THUMBNAIL' },
                    take: 1,
                  },
                  owner: {
                    select: {
                      id: true,
                      username: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    }

    return this.formatCart(cart);
  }

  /**
   * Add item to cart
   */
  async addItem(userId: string, assetId: string) {
    // Get cart
    const cart = await this.prisma.cart.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });

    // Check if asset exists and is approved
    const asset = await this. prisma.asset.findUnique({
      where: { id:  assetId, deletedAt: null },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    if (asset.status !== 'APPROVED') {
      throw new BadRequestException('This asset is not available for purchase');
    }

    // Can't add your own asset
    if (asset. ownerId === userId) {
      throw new BadRequestException('You cannot purchase your own asset');
    }

    // Check if already owns this asset
    const alreadyOwns = await this. prisma.userAsset.findUnique({
      where: {
        userId_assetId: {
          userId,
          assetId,
        },
      },
    });

    if (alreadyOwns) {
      throw new ConflictException('You already own this asset');
    }

    // Check if already in cart
    const existing = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        assetId,
      },
    });

    if (existing) {
      throw new ConflictException('Asset already in cart');
    }

    // Add to cart
    await this.prisma.cartItem. create({
      data: {
        cartId: cart.id,
        assetId,
      },
    });

    return this.getOrCreateCart(userId);
  }

  /**
   * Remove item from cart
   */
  async removeItem(userId: string, assetId: string) {
    const cart = await this.prisma. cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    await this.prisma.cartItem. deleteMany({
      where: {
        cartId: cart.id,
        assetId,
      },
    });

    return this.getOrCreateCart(userId);
  }

  /**
   * Clear cart
   */
  async clearCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (cart) {
      await this. prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    }

    return { success: true };
  }

  /**
   * Format cart for response
   */
  private formatCart(cart: any) {
    const items = cart.items.map((item: any) => ({
      id: item.id,
      assetId: item.assetId,
      asset: {
        id: item. asset.id,
        title: item.asset.title,
        price: Number(item.asset.price),
        thumbnailUrl: item.asset.files[0]?.fileUrl
          ? this.storage.getPublicUrl(item.asset. files[0].fileUrl)
          : null,
        owner: {
          username: item.asset.owner.username,
        },
      },
    }));

    const totalAmount = items.reduce((sum: number, item: any) => sum + item.asset.price, 0);

    return {
      id: cart. id,
      items,
      totalAmount,
      itemCount: items.length,
    };
  }
}