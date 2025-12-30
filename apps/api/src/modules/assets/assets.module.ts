import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { BullModule } from '@nestjs/bullmq';
import { AssetsController } from './assets.controller';
import { AssetsService } from './assets.service';

@Module({
  imports: [
    MulterModule.register({
      limits:  {
        fileSize: 500 * 1024 * 1024, // 500MB max
        files: 10, // Max 10 files per upload
      },
    }),
    BullModule.registerQueue({
      name:  'media',
    }),
  ],
  controllers:  [AssetsController],
  providers: [AssetsService],
  exports: [AssetsService],
})
export class AssetsModule {}