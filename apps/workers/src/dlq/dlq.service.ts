import { Injectable, Logger } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';

@Injectable()
export class DlqService {
  private readonly logger = new Logger(DlqService.name);
  private readonly producer: Producer;
  private connected = false;

  constructor() {
    const kafka = new Kafka({
      clientId: process.env.KAFKA_CLIENT_ID || 'assetbox-workers-dlq',
      brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
    });
    this.producer = kafka.producer();
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.producer.connect();
      this.connected = true;
      this.logger.log('DLQ producer connected');
    } catch (error) {
      this.logger.error('Failed to connect DLQ producer', error);
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.connected) {
      await this.producer.disconnect();
    }
  }

  /**
   * Publish a failed message to its corresponding Dead Letter Queue topic.
   * @param originalTopic  The topic that originally received the message (e.g. 'asset-events')
   * @param originalMessage  The raw message value that failed processing
   * @param error  The error that caused the failure
   */
  async sendToDeadLetterQueue(
    originalTopic: string,
    originalMessage: unknown,
    error: Error,
  ): Promise<void> {
    const dlqTopic = `${originalTopic}.dlq`;

    const dlqPayload = {
      originalTopic,
      originalMessage,
      error: {
        message: error.message,
        stack: error.stack,
      },
      failedAt: new Date().toISOString(),
    };

    if (!this.connected) {
      this.logger.warn(`DLQ producer not connected — logging failed message for topic "${dlqTopic}"`);
      this.logger.error('DLQ payload (not sent)', JSON.stringify(dlqPayload));
      return;
    }

    try {
      await this.producer.send({
        topic: dlqTopic,
        messages: [{ value: JSON.stringify(dlqPayload) }],
      });
      this.logger.warn(`Message sent to DLQ topic "${dlqTopic}"`);
    } catch (dlqError) {
      this.logger.error(`Failed to send to DLQ topic "${dlqTopic}"`, dlqError);
    }
  }
}
