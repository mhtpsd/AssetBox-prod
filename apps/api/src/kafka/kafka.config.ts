import { ConfigService } from '@nestjs/config';
import { KafkaOptions, Transport } from '@nestjs/microservices';

export const kafkaConfig = (configService: ConfigService): KafkaOptions => ({
  transport: Transport.KAFKA,
  options: {
    client: {
      clientId: configService.get<string>('kafka.clientId', 'assetbox-api'),
      brokers: configService.get<string[]>('kafka.brokers', ['localhost:9092']),
    },
    consumer: {
      groupId: configService.get<string>('kafka.groupId', 'assetbox-consumers'),
    },
  },
});
