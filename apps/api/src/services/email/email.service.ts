import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

export interface SendEmailOptions {
  to:  string | string[];
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend:  Resend;
  private readonly from: string;
  private readonly isProduction: boolean;

  constructor(private readonly config: ConfigService) {
    this.resend = new Resend(this.config.get<string>('email. resendApiKey'));
    this.from = this.config.get<string>('email. from')!;
    this.isProduction = this.config.get<string>('nodeEnv') === 'production';
  }

  async send(options: SendEmailOptions): Promise<boolean> {
    const { to, subject, html, text } = options;

    // In development, log instead of sending
    if (! this.isProduction) {
      this.logger.log(`[DEV EMAIL] To: ${to} | Subject: ${subject}`);
      this.logger.debug(html);
      return true;
    }

    try {
      await this.resend. emails.send({
        from: this.from,
        to:  Array.isArray(to) ? to : [to],
        subject,
        html,
        text,
      });

      this.logger.log(`Email sent to ${to}:  ${subject}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email:  ${error.message}`);
      return false;
    }
  }

  // Pre-built email templates

  async sendAssetApproved(to: string, assetTitle: string, assetId: string): Promise<boolean> {
    const frontendUrl = this.config.get<string>('frontendUrl');
    
    return this.send({
      to,
      subject: `Your asset "${assetTitle}" has been approved!  ✅`,
      html: `
        <div style="max-width:  600px; margin: 0 auto; padding: 20px; font-family: sans-serif;">
          <h1 style="color: #10b981;">Asset Approved! </h1>
          <p>Great news! Your asset <strong>"${assetTitle}"</strong> has been reviewed and approved.</p>
          <p>It's now live on the marketplace and available for purchase.</p>
          <div style="margin:  30px 0;">
            <a href="${frontendUrl}/assets/${assetId}" 
               style="background-color: #000; color: #fff; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px;">
              View Your Asset
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            Thank you for contributing to AssetBox!
          </p>
        </div>
      `,
    });
  }

  async sendAssetRejected(
    to: string,
    assetTitle: string,
    assetId: string,
    reason:  string,
  ): Promise<boolean> {
    const frontendUrl = this. config.get<string>('frontendUrl');
    
    return this.send({
      to,
      subject: `Your asset "${assetTitle}" needs changes`,
      html: `
        <div style="max-width:  600px; margin: 0 auto; padding: 20px; font-family: sans-serif;">
          <h1 style="color:  #ef4444;">Asset Not Approved</h1>
          <p>Your asset <strong>"${assetTitle}"</strong> was reviewed but could not be approved at this time.</p>
          <div style="background-color: #fef2f2; padding:  16px; border-radius: 8px; margin: 20px 0;">
            <strong>Reason:</strong>
            <p style="margin: 8px 0 0 0;">${reason}</p>
          </div>
          <p>You can make the necessary changes and resubmit your asset for review.</p>
          <div style="margin: 30px 0;">
            <a href="${frontendUrl}/dashboard/uploads/${assetId}" 
               style="background-color: #000; color: #fff; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px;">
              Edit Your Asset
            </a>
          </div>
        </div>
      `,
    });
  }

  async sendNewSale(
    to: string,
    assetTitle: string,
    buyerName: string,
    amount: number,
    earnings: number,
  ): Promise<boolean> {
    const frontendUrl = this.config.get<string>('frontendUrl');
    
    return this.send({
      to,
      subject: `You made a sale! 🎉 +$${earnings. toFixed(2)}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: sans-serif;">
          <h1 style="color: #10b981;">You Made a Sale!  🎉</h1>
          <p><strong>${buyerName}</strong> just purchased your asset: </p>
          <div style="background-color: #f3f4f6; padding: 16px; border-radius:  8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 18px;"><strong>${assetTitle}</strong></p>
            <p style="margin: 8px 0 0 0;">
              Sale Price: $${amount.toFixed(2)}<br>
              Your Earnings: <strong style="color: #10b981;">$${earnings.toFixed(2)}</strong>
            </p>
          </div>
          <div style="margin: 30px 0;">
            <a href="${frontendUrl}/dashboard/wallet" 
               style="background-color:  #000; color:  #fff; padding:  12px 24px; 
                      text-decoration:  none; border-radius: 6px;">
              View Your Earnings
            </a>
          </div>
        </div>
      `,
    });
  }

  async sendPurchaseConfirmation(
    to: string,
    orderItems: { title: string; price: number }[],
    totalAmount:  number,
    orderId: string,
  ): Promise<boolean> {
    const frontendUrl = this.config.get<string>('frontendUrl');
    
    const itemsHtml = orderItems
      .map(
        (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.title}</td>
          <td style="padding:  12px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${item.price. toFixed(2)}</td>
        </tr>
      `,
      )
      .join('');

    return this. send({
      to,
      subject:  `Order Confirmation #${orderId. slice(0, 8)}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding:  20px; font-family: sans-serif;">
          <h1 style="color: #000;">Order Confirmed!</h1>
          <p>Thank you for your purchase. Here's your order summary:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background-color: #f3f4f6;">
                <th style="padding: 12px; text-align: left;">Item</th>
                <th style="padding: 12px; text-align:  right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
              <tr>
                <td style="padding: 12px; font-weight: bold;">Total</td>
                <td style="padding: 12px; text-align:  right; font-weight: bold;">$${totalAmount.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          
          <div style="margin: 30px 0;">
            <a href="${frontendUrl}/dashboard/purchases" 
               style="background-color:  #000; color:  #fff; padding:  12px 24px; 
                      text-decoration:  none; border-radius: 6px;">
              Download Your Assets
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            Order ID:  ${orderId}<br>
            All sales are final.  No refunds. 
          </p>
        </div>
      `,
    });
  }

  async sendPayoutProcessed(to: string, amount:  number): Promise<boolean> {
    return this.send({
      to,
      subject: `Payout Sent! 💰 $${amount.toFixed(2)}`,
      html: `
        <div style="max-width: 600px; margin:  0 auto; padding: 20px; font-family:  sans-serif;">
          <h1 style="color: #10b981;">Payout Processed! </h1>
          <p>Your payout of <strong>$${amount.toFixed(2)}</strong> has been processed and sent to your payment method.</p>
          <p>Please allow 2-5 business days for the funds to appear in your account.</p>
          <p style="color: #666; font-size:  14px;">
            Thank you for being a creator on AssetBox! 
          </p>
        </div>
      `,
    });
  }

  async sendPayoutRejected(to: string, amount: number, reason: string): Promise<boolean> {
    const frontendUrl = this.config.get<string>('frontendUrl');
    
    return this.send({
      to,
      subject: `Payout Request Update`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: sans-serif;">
          <h1 style="color: #ef4444;">Payout Not Processed</h1>
          <p>Your payout request for <strong>$${amount.toFixed(2)}</strong> could not be processed.</p>
          <div style="background-color: #fef2f2; padding:  16px; border-radius: 8px; margin: 20px 0;">
            <strong>Reason:</strong>
            <p style="margin: 8px 0 0 0;">${reason}</p>
          </div>
          <p>Please update your payment information and try again.</p>
          <div style="margin: 30px 0;">
            <a href="${frontendUrl}/dashboard/settings" 
               style="background-color:  #000; color:  #fff; padding:  12px 24px; 
                      text-decoration:  none; border-radius: 6px;">
              Update Settings
            </a>
          </div>
        </div>
      `,
    });
  }
}