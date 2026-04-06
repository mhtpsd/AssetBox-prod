import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer, ProducerRecord } from 'kafkajs';

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaProducerService.name);
  private readonly kafka: Kafka;
  private readonly producer: Producer;
  private connected = false;

  constructor(private readonly configService: ConfigService) {
    this.kafka = new Kafka({
      clientId: this.configService.get<string>('kafka.clientId', 'assetbox-api'),
      brokers: this.configService.get<string[]>('kafka.brokers', ['localhost:9092']),
    });

    this.producer = this.kafka.producer();
  }

  async onModuleInit(): Promise<void> {
    await this.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.disconnect();
  }

  private async connect(): Promise<void> {
    try {
      await this.producer.connect();
      this.connected = true;
      this.logger.log('Kafka producer connected');
    } catch (error) {
      this.logger.error('Failed to connect Kafka producer', error);
      // Do not throw — allow app to start even if Kafka is temporarily unavailable
    }
  }

  private async disconnect(): Promise<void> {
    if (this.connected) {
      try {
        await this.producer.disconnect();
        this.connected = false;
        this.logger.log('Kafka producer disconnected');
      } catch (error) {
        this.logger.error('Failed to disconnect Kafka producer', error);
      }
    }
  }

  /**
   * Emit an event to a Kafka topic.
   * @param topic  The Kafka topic to publish to (e.g. 'asset-events')
   * @param event  The event payload — must be JSON-serialisable
   */
  async emit<T extends object>(topic: string, event: T): Promise<void> {
    if (!this.connected) {
      this.logger.warn(`Kafka not connected — skipping event on topic "${topic}"`);
      return;
    }

    const record: ProducerRecord = {
      topic,
      messages: [
        {
          value: JSON.stringify(event),
        },
      ],
    };

    try {
      await this.producer.send(record);
      this.logger.debug(`Event emitted to topic "${topic}"`);
    } catch (error) {
      this.logger.error(`Failed to emit event to topic "${topic}"`, error);
      throw error;
    }
  }

  /**
   * Check whether the producer is currently connected.
   */
  isConnected(): boolean {
    return this.connected;
  }
}
