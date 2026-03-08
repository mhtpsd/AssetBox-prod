import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppService } from './app.service';
import { PrismaService } from './modules/prisma/prisma.service';
import { MeiliSearch } from 'meilisearch';
import Redis from 'ioredis';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  async getHealth(): Promise<Record<string, unknown>> {
    const checks: Record<string, unknown> = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {},
    };

    // Database check
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      (checks.services as Record<string, unknown>)['database'] = { status: 'ok' };
    } catch {
      (checks.services as Record<string, unknown>)['database'] = { status: 'error' };
      checks.status = 'degraded';
    }

    // Redis check
    const redis = new Redis({
      host: this.configService.get<string>('redis.host'),
      port: this.configService.get<number>('redis.port'),
      ...(this.configService.get('redis.password') && {
        password: this.configService.get<string>('redis.password'),
      }),
      lazyConnect: true,
      connectTimeout: 3000,
    });
    try {
      await redis.connect();
      await redis.ping();
      (checks.services as Record<string, unknown>)['redis'] = { status: 'ok' };
    } catch {
      (checks.services as Record<string, unknown>)['redis'] = { status: 'error' };
      checks.status = 'degraded';
    } finally {
      redis.disconnect();
    }

    // Meilisearch check
    const meili = new MeiliSearch({
      host: this.configService.get<string>('meilisearch.host')!,
      apiKey: this.configService.get<string>('meilisearch.apiKey'),
    });
    try {
      await meili.health();
      (checks.services as Record<string, unknown>)['meilisearch'] = { status: 'ok' };
    } catch {
      (checks.services as Record<string, unknown>)['meilisearch'] = { status: 'error' };
      checks.status = 'degraded';
    }

    return checks;
  }
}
