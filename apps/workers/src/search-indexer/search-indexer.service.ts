import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { MeiliSearch } from 'meilisearch';
import { AssetUploadedEvent } from '@assetbox/types';
import { DlqService } from '../dlq/dlq.service';

@Injectable()
export class SearchIndexerService implements OnModuleInit {
  private readonly logger = new Logger(SearchIndexerService.name);
  private readonly meili: MeiliSearch;

  constructor(private readonly dlqService: DlqService) {
    this.meili = new MeiliSearch({
      host: process.env.MEILISEARCH_HOST || 'http://localhost:7700',
      apiKey: process.env.MEILISEARCH_API_KEY,
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.meili.health();
      this.logger.log('Meilisearch connection verified');
    } catch {
      this.logger.warn('Meilisearch not reachable on startup — will retry on demand');
    }
  }

  /**
   * Index a newly uploaded asset in Meilisearch.
   */
  async indexAsset(event: AssetUploadedEvent): Promise<void> {
    const { assetId, sellerId, fileName, fileType, fileSize, bucketKey } = event.payload;

    const document = {
      id: assetId,
      sellerId,
      fileName,
      fileType,
      fileSize,
      bucketKey,
      indexedAt: new Date().toISOString(),
    };

    await this.meili.index('assets').addDocuments([document]);
    this.logger.log(`Asset ${assetId} indexed in Meilisearch`);
  }

  /**
   * Send a failed indexing event to the Dead Letter Queue.
   */
  async handleIndexingFailure(
    originalTopic: string,
    event: AssetUploadedEvent,
    error: Error,
  ): Promise<void> {
    await this.dlqService.sendToDeadLetterQueue(originalTopic, event, error);
  }
}
