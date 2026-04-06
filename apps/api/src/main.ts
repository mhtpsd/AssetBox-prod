import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { JsonLogger } from './common/logger/json-logger.service';
import cookieParser = require('cookie-parser');

async function bootstrap() {
  // Use structured JSON logging in production; fall back to default in dev
  const logger = new JsonLogger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    rawBody: true, // Required for Stripe webhook signature verification
    logger: process.env.NODE_ENV === 'production' ? new JsonLogger() : undefined,
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

  logger.log(`🚀 API running on http://localhost:${port}/api`, 'Bootstrap');
}

bootstrap();
