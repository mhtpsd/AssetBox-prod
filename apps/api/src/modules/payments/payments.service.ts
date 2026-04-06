import { Injectable, Inject, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../../services/email/email.service';
import { KafkaProducerService } from '../../kafka/kafka.producer.service';
import { AssetPurchasedEvent } from '@assetbox/types';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @Inject('STRIPE') private readonly stripe: Stripe,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly email: EmailService,
    private readonly kafkaProducer: KafkaProducerService,
  ) {}

  /**
   * Create Stripe checkout session
   */
  async createCheckoutSession(userId: string) {
    // Get cart with items
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            asset: {
              include: {
                files: {
                  where: { fileType:  'THUMBNAIL' },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Get user info
    const user = await this. prisma.user.findUnique({
      where: { id:  userId },
      select: { email: true },
    });

    // Create line items for Stripe
    const lineItems:  Stripe.Checkout.SessionCreateParams.LineItem[] = cart.items.map(
      (item) => ({
        price_data:  {
          currency: 'usd',
          product_data: {
            name:  item.asset.title,
            description: item.asset.description?. slice(0, 100),
            images: item.asset.files[0]?.fileUrl
              ? [this.getPublicUrl(item.asset. files[0].fileUrl)]
              : [],
          },
          unit_amount: Math.round(Number(item.asset.price) * 100), // Convert to cents
        },
        quantity: 1,
      }),
    );

    // Create Stripe session
    const session = await this.stripe.checkout.sessions. create({
      customer_email: user?. email,
      line_items: lineItems,
      mode: 'payment',
      success_url: `${this.config.get('frontendUrl')}/checkout/success? session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${this.config.get('frontendUrl')}/cart`,
      metadata: {
        userId,
        cartId: cart.id,
      },
    });

    return {
      sessionId: session. id,
      url: session.url,
    };
  }

  /**
   * Handle Stripe webhook
   */
  async handleWebhook(signature: string, payload: Buffer) {
    const webhookSecret = this.config.get<string>('stripe.webhookSecret');

    let event:  Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret! );
    } catch (err: any) {
      this.logger.error(`Webhook signature verification failed: ${err.message}`);
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    this.logger.log(`Processing webhook:  ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'checkout.session.expired':
        this.logger.log(`Checkout session expired: ${event. data.object.id}`);
        break;
      default:
        this.logger.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  }

  /**
   * Handle successful checkout
   */
  private async handleCheckoutCompleted(session:  Stripe.Checkout.Session) {
    const stripePaymentId = session.id;
    const userId = session.metadata?. userId;
    const cartId = session.metadata?.cartId;

    if (! userId || !cartId) {
      this.logger.error('Missing metadata in Stripe session');
      return;
    }

    // IDEMPOTENCY CHECK: If order already exists, skip
    const existingOrder = await this.prisma.order.findFirst({
      where: { stripePaymentId },
    });

    if (existingOrder) {
      this.logger. log(`Order already processed for session ${stripePaymentId}`);
      return { orderId: existingOrder.id, alreadyProcessed: true };
    }

    // Get cart items
    const cart = await this. prisma.cart.findUnique({
      where: { id:  cartId },
      include: {
        items: {
          include: {
            asset: {
              include: {
                owner: true,
              },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      this.logger. error('Cart not found or empty');
      return;
    }

    // Calculate total
    const totalAmount = cart.items.reduce(
      (sum, item) => sum + Number(item.asset.price),
      0,
    );

    // Process order in transaction
    const order = await this. prisma.$transaction(async (tx) => {
      // 1. Create order
      const newOrder = await tx.order.create({
        data: {
          userId,
          totalAmount,
          paymentStatus: 'PAID',
          stripePaymentId,
          items: {
            create: cart. items.map((item) => ({
              assetId: item.assetId,
              price: item.asset.price,
            })),
          },
        },
        include: {
          items:  {
            include: {
              asset: true,
            },
          },
        },
      });

      // 2. Create UserAsset entries (download rights)
      for (const item of cart.items) {
        await tx.userAsset.upsert({
          where: {
            userId_assetId:  {
              userId,
              assetId: item.assetId,
            },
          },
          create: {
            userId,
            assetId: item. assetId,
            orderId: newOrder.id,
          },
          update: {},
        });
      }

      // 3. Create earnings for creators
      const platformFeePercent = (this.config.get<number>('platform.commissionPercent') ?? 10) / 100;

      for (const item of cart. items) {
        const price = Number(item.asset.price);
        const platformFee = price * platformFeePercent;
        const creatorEarning = price - platformFee;

        // Create earning record
        await tx.earning.create({
          data: {
            userId:  item.asset. ownerId,
            assetId: item.assetId,
            orderId: newOrder.id,
            amount: creatorEarning,
            platformFee,
          },
        });

        // Update creator wallet
        await tx.user.update({
          where: { id: item.asset.ownerId },
          data: {
            walletBalance: { increment: creatorEarning },
          },
        });

        // Update asset download count
        await tx.asset.update({
          where: { id:  item.assetId },
          data: {
            totalDownloads: { increment: 1 },
          },
        });

        // Send notification to creator
        await tx.notification.create({
          data: {
            userId: item. asset.ownerId,
            type: 'NEW_SALE',
            title: 'New Sale!  🎉',
            message: `Your asset "${item.asset.title}" was purchased for $${price. toFixed(2)}`,
            data: {
              assetId: item.assetId,
              orderId: newOrder.id,
              amount: price,
              earnings: creatorEarning,
            },
          },
        });
      }

      // 4. Clear cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return newOrder;
    });

    this.logger.log(`Order processed successfully:  ${order.id}`);

    // Send emails (outside transaction)
    await this.sendOrderEmails(order, cart);

    // Publish asset.purchased events for each order item
    for (const item of order.items ?? []) {
      const event: AssetPurchasedEvent = {
        eventId: uuidv4(),
        timestamp: new Date().toISOString(),
        payload: {
          assetId: item.assetId,
          buyerId: order.userId,
          sellerId: item.sellerId ?? '',
          amount: Number(item.price ?? 0),
          currency: 'usd',
          stripePaymentId: stripePaymentId,
        },
      };
      await this.kafkaProducer.emit('purchase-events', event);
    }

    return { orderId: order.id };
  }

  /**
   * Send order confirmation emails
   */
  private async sendOrderEmails(order: any, cart: any) {
    // Get buyer info
    const buyer = await this.prisma.user.findUnique({
      where: { id: order.userId },
      select: { email: true, name: true },
    });

    if (!buyer?. email) return;

    // Send confirmation to buyer
    await this.email. sendPurchaseConfirmation(
      buyer.email,
      order.items.map((item: any) => ({
        title: item.asset.title,
        price: Number(item.price),
      })),
      Number(order.totalAmount),
      order.id,
    );

    // Send sale notifications to creators
    const creatorEmails = new Map<string, any[]>();

    for (const item of cart.items) {
      const creatorId = item.asset.ownerId;
      if (! creatorEmails.has(creatorId)) {
        creatorEmails.set(creatorId, []);
      }
      creatorEmails.get(creatorId)!.push(item.asset);
    }

    const platformFeePercent = (this.config.get<number>('platform.commissionPercent') ?? 10) / 100;

    for (const [creatorId, assets] of creatorEmails) {
      const creator = await this.prisma.user.findUnique({
        where: { id: creatorId },
        select: { email: true },
      });

      if (creator?.email) {
        for (const asset of assets) {
          const price = Number(asset.price);
          const earnings = price - price * platformFeePercent;

          await this.email.sendNewSale(
            creator.email,
            asset.title,
            buyer.name || 'A customer',
            price,
            earnings,
          );
        }
      }
    }
  }

  /**
   * Get public URL for asset thumbnail
   */
  private getPublicUrl(key: string): string {
    const cdnUrl = this.config.get<string>('storage.cdnUrl');
    const bucket = this.config.get<string>('storage.bucketPublic');
    return `${cdnUrl}/${bucket}/${key}`;
  }
}