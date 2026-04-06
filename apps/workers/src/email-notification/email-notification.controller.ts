import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload, Ctx, KafkaContext } from '@nestjs/microservices';
import { AssetPurchasedEvent, UserRegisteredEvent } from '@assetbox/types';
import { EmailNotificationService } from './email-notification.service';

@Controller()
export class EmailNotificationController {
  private readonly logger = new Logger(EmailNotificationController.name);

  constructor(private readonly emailService: EmailNotificationService) {}

  /**
   * Send purchase confirmation email when an asset is purchased.
   */
  @EventPattern('purchase-events')
  async handleAssetPurchased(
    @Payload() event: AssetPurchasedEvent,
    @Ctx() context: KafkaContext,
  ): Promise<void> {
    const heartbeat = context.getHeartbeat();
    this.logger.log(`Received asset.purchased event for asset: ${event.payload?.assetId}`);

    try {
      await heartbeat();
      await this.emailService.sendPurchaseConfirmation(event);
    } catch (error) {
      this.logger.error(
        `Failed to send purchase email for asset ${event.payload?.assetId}`,
        error,
      );
      await this.emailService.handleEmailFailure('purchase-events', event, error as Error);
    }
  }

  /**
   * Send welcome email when a new user registers.
   */
  @EventPattern('user-events')
  async handleUserRegistered(
    @Payload() event: UserRegisteredEvent,
    @Ctx() context: KafkaContext,
  ): Promise<void> {
    const heartbeat = context.getHeartbeat();
    this.logger.log(`Received user.registered event for user: ${event.payload?.userId}`);

    try {
      await heartbeat();
      await this.emailService.sendWelcomeEmail(event);
    } catch (error) {
      this.logger.error(
        `Failed to send welcome email for user ${event.payload?.userId}`,
        error,
      );
      await this.emailService.handleEmailFailure('user-events', event, error as Error);
    }
  }
}
