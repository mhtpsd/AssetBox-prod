import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { WalletService } from './wallet.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

class RequestPayoutDto {
  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  amount: number;
}

@Controller('wallet')
@UseGuards(AuthGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  /**
   * Get wallet balance
   */
  @Get('balance')
  async getBalance(@CurrentUser('id') userId: string) {
    return this.walletService.getBalance(userId);
  }

  /**
   * Get earnings history
   */
  @Get('earnings')
  async getEarnings(
    @CurrentUser('id') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.walletService.getEarnings(userId, page || 1, limit || 20);
  }

  /**
   * Get earnings stats
   */
  @Get('stats')
  async getStats(@CurrentUser('id') userId: string) {
    return this.walletService.getStats(userId);
  }

  /**
   * Request payout
   */
  @Post('payout')
  async requestPayout(
    @CurrentUser('id') userId: string,
    @Body() dto: RequestPayoutDto,
  ) {
    return this.walletService.requestPayout(userId, dto.amount);
  }

  /**
   * Get payout history
   */
  @Get('payouts')
  async getPayouts(
    @CurrentUser('id') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.walletService.getPayouts(userId, page || 1, limit || 20);
  }
}