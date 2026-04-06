import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload, Ctx, KafkaContext } from '@nestjs/microservices';
import { AssetPurchasedEvent } from '@assetbox/types';
import { AnalyticsService } from './analytics.service';

@Controller()
export class AnalyticsController {
  private readonly logger = new Logger(AnalyticsController.name);

  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * Listen for asset.purchased events and record analytics data.
   */
  @EventPattern('purchase-events')
  async handleAssetPurchased(
    @Payload() event: AssetPurchasedEvent,
    @Ctx() context: KafkaContext,
  ): Promise<void> {
    const heartbeat = context.getHeartbeat();
    this.logger.log(`Recording analytics for purchased asset: ${event.payload?.assetId}`);

    try {
      await heartbeat();
      await this.analyticsService.recordPurchase(event);
    } catch (error) {
      this.logger.error(
        `Failed to record analytics for asset ${event.payload?.assetId}`,
        error,
      );
      await this.analyticsService.handleAnalyticsFailure('purchase-events', event, error as Error);
    }
  }
}
