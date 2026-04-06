import { Module } from '@nestjs/common';
import { SearchIndexerController } from './search-indexer.controller';
import { SearchIndexerService } from './search-indexer.service';

@Module({
  controllers: [SearchIndexerController],
  providers: [SearchIndexerService],
})
export class SearchIndexerModule {}
