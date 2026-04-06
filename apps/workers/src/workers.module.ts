import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SearchIndexerModule } from './search-indexer/search-indexer.module';
import { EmailNotificationModule } from './email-notification/email-notification.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { DlqModule } from './dlq/dlq.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.local',
    }),
    DlqModule,
    SearchIndexerModule,
    EmailNotificationModule,
    AnalyticsModule,
  ],
})
export class WorkersModule {}
