import { Injectable, Logger } from '@nestjs/common';
import { AssetPurchasedEvent } from '@assetbox/types';
import { DlqService } from '../dlq/dlq.service';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private readonly dlqService: DlqService) {}

  /**
   * Record a purchase analytics event.
   *
   * In a production environment this would write to a time-series database,
   * data warehouse (e.g. BigQuery, Redshift), or an analytics platform.
   * For now we log the structured event so it can be captured by a log aggregator.
   */
  async recordPurchase(event: AssetPurchasedEvent): Promise<void> {
    const { assetId, buyerId, sellerId, amount, currency, stripePaymentId } = event.payload;

    const record = {
      eventId: event.eventId,
      timestamp: event.timestamp,
      type: 'asset.purchased',
      assetId,
      buyerId,
      sellerId,
      amount,
      currency,
      stripePaymentId,
    };

    // Structured log for aggregation by monitoring tools (Datadog, Grafana, etc.)
    this.logger.log(`[ANALYTICS] ${JSON.stringify(record)}`);
  }

  /**
   * Send a failed analytics event to the Dead Letter Queue.
   */
  async handleAnalyticsFailure(
    originalTopic: string,
    event: AssetPurchasedEvent,
    error: Error,
  ): Promise<void> {
    await this.dlqService.sendToDeadLetterQueue(originalTopic, event, error);
  }
}
