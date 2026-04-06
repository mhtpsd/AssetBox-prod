import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { WorkersModule } from './workers.module';

const logger = new Logger('WorkersBootstrap');

async function bootstrap() {
  const brokers = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');
  const groupId = process.env.KAFKA_GROUP_ID || 'assetbox-consumers';

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(WorkersModule, {
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: process.env.KAFKA_CLIENT_ID || 'assetbox-workers',
        brokers,
      },
      consumer: {
        groupId,
      },
    },
  });

  await app.listen();
  logger.log(`Workers microservice is listening (brokers: ${brokers.join(', ')}, group: ${groupId})`);
}

bootstrap().catch((err) => {
  logger.error('Failed to start workers microservice', err);
  process.exit(1);
});
