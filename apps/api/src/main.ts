import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';
import cookieParser = require('cookie-parser');

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true, // Required for Stripe webhook signature verification
  });
  const configService = app.get(ConfigService);

  // Security
  app.use(helmet());

  // Cookie parser (for NextAuth session tokens)
  app.use(cookieParser());

  // CORS
  const rawOrigins = configService.get<string>('frontendUrl') || 'http://localhost:3000';
  const origins = rawOrigins.split(',').map((o) => o.trim());
  app.enableCors({
    origin: origins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'stripe-signature'],
  });

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Prefix
  app.setGlobalPrefix('api');

  const port = configService.get('port');
  await app.listen(port);

  console.log(`🚀 API running on http://localhost:${port}/api`);
}

bootstrap();
