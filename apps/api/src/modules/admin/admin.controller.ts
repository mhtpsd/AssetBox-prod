import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { IsString, MinLength, IsOptional } from 'class-validator';
import { AdminService } from './admin.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';

class ApproveAssetDto {
  @IsOptional()
  @IsString()
  note?: string;
}

class RejectAssetDto {
  @IsString()
  @MinLength(10)
  reason: string;
}

class RejectPayoutDto {
  @IsString()
  @MinLength(10)
  reason: string;
}

@Controller('admin')
@UseGuards(AuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * Get admin stats
   */
  @Get('stats')
  async getStats() {
    return this.adminService.getStats();
  }

  /**
   * Get pending assets
   */
  @Get('assets/pending')
  async getPendingAssets(
    @Query('page') page?:  number,
    @Query('limit') limit?: number,
  ) {
    return this.adminService.getPendingAssets(page || 1, limit || 20);
  }

  /**
   * Get asset for review
   */
  @Get('assets/:id')
  async getAssetForReview(@Param('id', ParseUUIDPipe) assetId: string) {
    return this.adminService.getAssetForReview(assetId);
  }

  /**
   * Approve asset
   */
  @Patch('assets/: id/approve')
  async approveAsset(
    @Param('id', ParseUUIDPipe) assetId: string,
    @Body() dto: ApproveAssetDto,
  ) {
    return this.adminService.approveAsset(assetId, dto.note);
  }

  /**
   * Reject asset
   */
  @Patch('assets/: id/reject')
  async rejectAsset(
    @Param('id', ParseUUIDPipe) assetId: string,
    @Body() dto: RejectAssetDto,
  ) {
    return this.adminService.rejectAsset(assetId, dto.reason);
  }

  /**
   * Get pending payouts
   */
  @Get('payouts/pending')
  async getPendingPayouts(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.adminService.getPendingPayouts(page || 1, limit || 20);
  }

  /**
   * Process payout
   */
  @Patch('payouts/:id/process')
  async processPayout(@Param('id', ParseUUIDPipe) payoutId: string) {
    return this.adminService.processPayout(payoutId);
  }

  /**
   * Reject payout
   */
  @Patch('payouts/:id/reject')
  async rejectPayout(
    @Param('id', ParseUUIDPipe) payoutId: string,
    @Body() dto: RejectPayoutDto,
  ) {
    return this.adminService.rejectPayout(payoutId, dto.reason);
  }

  /**
   * Reindex all approved assets to Meilisearch
   */
  @Post('assets/reindex')
  async reindexAssets() {
    return this.adminService.reindexAssets();
  }
}