import {
  Controller,
  Post,
  Req,
  Headers,
  RawBodyRequest,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * Create checkout session
   */
  @Post('checkout')
  @UseGuards(AuthGuard)
  async createCheckout(@CurrentUser('id') userId: string) {
    return this.paymentsService.createCheckoutSession(userId);
  }

  /**
   * Handle Stripe webhook
   */
  @Post('webhook')
  @Public()
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    return this.paymentsService.handleWebhook(signature, req. rawBody! );
  }
}