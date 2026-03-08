import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { EmailModule } from '../../services/email/email.module';

@Module({
  imports: [EmailModule],
  controllers: [PaymentsController],
  providers:  [
    {
      provide: 'STRIPE',
      useFactory: (configService: ConfigService) => {
        return new Stripe(configService.get<string>('stripe.secretKey')!, {
          apiVersion: '2025-01-27.acacia',
        });
      },
      inject: [ConfigService],
    },
    PaymentsService,
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}