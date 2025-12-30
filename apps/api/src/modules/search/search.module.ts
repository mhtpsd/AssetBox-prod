import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MeiliSearch } from 'meilisearch';
import { SearchService } from './search.service';

@Global()
@Module({
  providers: [
    {
      provide: 'MEILISEARCH',
      useFactory: (configService: ConfigService) => {
        return new MeiliSearch({
          host: configService.get<string>('meilisearch.host')!,
          apiKey: configService.get<string>('meilisearch.apiKey'),
        });
      },
      inject:  [ConfigService],
    },
    SearchService,
  ],
  exports: [SearchService],
})
export class SearchModule {}