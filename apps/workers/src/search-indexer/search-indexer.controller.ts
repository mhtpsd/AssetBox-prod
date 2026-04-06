import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload, Ctx, KafkaContext } from '@nestjs/microservices';
import { AssetUploadedEvent } from '@assetbox/types';
import { SearchIndexerService } from './search-indexer.service';

@Controller()
export class SearchIndexerController {
  private readonly logger = new Logger(SearchIndexerController.name);

  constructor(private readonly searchIndexerService: SearchIndexerService) {}

  /**
   * Listen for asset.uploaded events on the 'asset-events' topic and
   * index the newly uploaded asset in Meilisearch.
   */
  @EventPattern('asset-events')
  async handleAssetUploaded(
    @Payload() event: AssetUploadedEvent,
    @Ctx() context: KafkaContext,
  ): Promise<void> {
    const heartbeat = context.getHeartbeat();
    this.logger.log(`Received asset.uploaded event for asset: ${event.payload?.assetId}`);

    try {
      await heartbeat();
      await this.searchIndexerService.indexAsset(event);
    } catch (error) {
      this.logger.error(
        `Failed to index asset ${event.payload?.assetId}`,
        error,
      );
      await this.searchIndexerService.handleIndexingFailure('asset-events', event, error as Error);
    }
  }
}
