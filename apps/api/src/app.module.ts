import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { BullModule } from '@nestjs/bullmq';

// Config
import configuration from './config/configuration';
import { validationSchema } from './config/validation';

// App
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Global Modules
import { PrismaModule } from './modules/prisma/prisma.module';
import { StorageModule } from './services/storage/storage.module';
import { EmailModule } from './services/email/email.module';
import { SearchModule } from './modules/search/search.module';

// Feature Modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AssetsModule } from './modules/assets/assets.module';
import { MarketplaceModule } from './modules/marketplace/marketplace.module';
import { CartModule } from './modules/cart/cart.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { DownloadsModule } from './modules/downloads/downloads.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { AdminModule } from './modules/admin/admin.module';
import { SupportModule } from './modules/support/support.module';

// Workers
import { MediaModule } from './workers/media/media.module';

// Common
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
      envFilePath: '.env.local',
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 10 },
      { name: 'medium', ttl: 10000, limit: 50 },
      { name: 'long', ttl: 60000, limit: 300 },
    ]),

    // Queue
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get('redis.host'),
          port: configService.get('redis.port'),
          ...(configService.get('redis.password') && {
            password: configService.get('redis.password'),
          }),
        },
      }),
      inject: [ConfigService],
    }),

    // Global modules
    PrismaModule,
    StorageModule,
    EmailModule,
    SearchModule,

    // Feature modules
    AuthModule,
    UsersModule,
    AssetsModule,
    MarketplaceModule,
    CartModule,
    OrdersModule,
    PaymentsModule,
    DownloadsModule,
    NotificationsModule,
    WalletModule,
    AdminModule,
    SupportModule,

    // Workers
    MediaModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}