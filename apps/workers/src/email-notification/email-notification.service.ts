import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { AssetPurchasedEvent, UserRegisteredEvent } from '@assetbox/types';
import { DlqService } from '../dlq/dlq.service';

@Injectable()
export class EmailNotificationService {
  private readonly logger = new Logger(EmailNotificationService.name);
  private readonly resend: Resend;
  private readonly fromAddress: string;

  constructor(private readonly dlqService: DlqService) {
    this.resend = new Resend(process.env.RESEND_API_KEY);
    this.fromAddress = process.env.EMAIL_FROM || 'noreply@assetbox.com';
  }

  /**
   * Send a purchase confirmation email to the buyer.
   */
  async sendPurchaseConfirmation(event: AssetPurchasedEvent): Promise<void> {
    const { assetId, buyerId, amount, currency, stripePaymentId } = event.payload;

    this.logger.log(`Sending purchase confirmation for asset ${assetId} to buyer ${buyerId}`);

    await this.resend.emails.send({
      from: this.fromAddress,
      to: buyerId, // In production this would be the buyer's email address
      subject: 'Your AssetBox purchase is confirmed!',
      html: `
        <h2>Thank you for your purchase!</h2>
        <p>Asset ID: <strong>${assetId}</strong></p>
        <p>Amount: <strong>${(amount / 100).toFixed(2)} ${currency.toUpperCase()}</strong></p>
        <p>Payment reference: <code>${stripePaymentId}</code></p>
        <p>You can download your asset from your <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/library">library</a>.</p>
      `,
    });

    this.logger.log(`Purchase confirmation email sent for asset ${assetId}`);
  }

  /**
   * Send a welcome email to a newly registered user.
   */
  async sendWelcomeEmail(event: UserRegisteredEvent): Promise<void> {
    const { userId, email, name } = event.payload;

    this.logger.log(`Sending welcome email to user ${userId} (${email})`);

    await this.resend.emails.send({
      from: this.fromAddress,
      to: email,
      subject: 'Welcome to AssetBox!',
      html: `
        <h2>Welcome to AssetBox${name ? `, ${name}` : ''}!</h2>
        <p>We're excited to have you on board. Start exploring thousands of digital assets today.</p>
        <p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/marketplace">Browse the marketplace</a></p>
      `,
    });

    this.logger.log(`Welcome email sent to ${email}`);
  }

  /**
   * Send a failed email event to the Dead Letter Queue.
   */
  async handleEmailFailure(
    originalTopic: string,
    event: AssetPurchasedEvent | UserRegisteredEvent,
    error: Error,
  ): Promise<void> {
    await this.dlqService.sendToDeadLetterQueue(originalTopic, event, error);
  }
}
