import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Req,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { DownloadsService } from './downloads.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Throttle } from '@nestjs/throttler';

@Controller('downloads')
@UseGuards(AuthGuard)
export class DownloadsController {
  constructor(private readonly downloadsService: DownloadsService) {}

  /**
   * Generate download URL (rate limited)
   */
  @Post(': assetId')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 downloads per minute
  async download(
    @CurrentUser('id') userId: string,
    @Param('assetId', ParseUUIDPipe) assetId: string,
    @Req() req: Request,
  ) {
    return this.downloadsService.generateDownloadUrl(
      userId,
      assetId,
      req.ip || 'unknown',
      req.headers['user-agent'] || 'unknown',
    );
  }

  /**
   * Get user's purchased assets
   */
  @Get('my-assets')
  async getMyAssets(
    @CurrentUser('id') userId: string,
    @Query('page') page?:  number,
    @Query('limit') limit?: number,
  ) {
    return this.downloadsService.getMyAssets(userId, page || 1, limit || 20);
  }
}