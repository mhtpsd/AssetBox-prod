import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'AssetBox Terms of Service and User Agreement',
};

export default function TermsPage() {
  return (
    <div className="container max-w-4xl py-12">
      <h1 className="text-4xl font-bold">Terms of Service</h1>
      <p className="mt-4 text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

      <div className="prose prose-gray mt-8 dark:prose-invert max-w-none">
        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing and using AssetBox ("the Platform"), you accept and agree to be bound by the
          terms and provision of this agreement. If you do not agree to these Terms of Service,
          please do not use the Platform.
        </p>

        <h2>2. Description of Service</h2>
        <p>
          AssetBox is a digital marketplace where creators can upload, sell, and distribute digital
          assets including but not limited to images, videos, audio files, templates, 3D models,
          and other digital content ("Assets"). Buyers can browse, purchase, and download Assets
          for use in accordance with the applicable license terms.
        </p>

        <h2>3. User Accounts</h2>
        <h3>3.1 Registration</h3>
        <p>
          To use certain features of the Platform, you must register for an account. You agree to
          provide accurate, current, and complete information during registration and to update
          such information to keep it accurate, current, and complete. 
        </p>

        <h3>3.2 Account Security</h3>
        <p>
          You are responsible for maintaining the confidentiality of your account and password.  You
          agree to accept responsibility for all activities that occur under your account. 
        </p>

        <h2>4. Creator Terms</h2>
        <h3>4.1 Content Ownership</h3>
        <p>
          You retain ownership of all intellectual property rights in the Assets you upload. 
          However, you grant AssetBox a non-exclusive, worldwide license to host, display, and
          distribute your Assets through the Platform.
        </p>

        <h3>4.2 Content Requirements</h3>
        <p>You represent and warrant that: </p>
        <ul>
          <li>You own or have the necessary rights to all Assets you upload</li>
          <li>Your Assets do not infringe on any third-party intellectual property rights</li>
          <li>Your Assets comply with all applicable laws and regulations</li>
          <li>Your Assets do not contain malicious code, viruses, or harmful content</li>
        </ul>

        <h3>4.3 Prohibited Content</h3>
        <p>You may not upload Assets that:</p>
        <ul>
          <li>Infringe on intellectual property rights</li>
          <li>Contain illegal, harmful, or offensive content</li>
          <li>Violate privacy rights or depict identifiable persons without consent</li>
          <li>Contain trademarked logos or brands without permission</li>
        </ul>

        <h3>4.4 Commission and Payments</h3>
        <p>
          AssetBox charges a 10% commission on all sales. The remaining 90% is credited to your
          wallet and can be withdrawn once your balance reaches $50 minimum.  Payments are processed
          within 5-7 business days of payout request approval.
        </p>

        <h2>5. Buyer Terms</h2>
        <h3>5.1 License Types</h3>
        <p>
          When you purchase an Asset, you receive a license to use it according to the license type
          selected. Please review the specific license terms for each Asset before purchase.
        </p>

        <h3>5.2 Refund Policy</h3>
        <p>
          All sales are final. Due to the digital nature of our products, we do not offer refunds
          once an Asset has been downloaded. Please review Assets carefully before purchasing.
        </p>

        <h2>6. Intellectual Property</h2>
        <p>
          The Platform itself, including its design, features, and functionality, is owned by
          AssetBox and is protected by international copyright, trademark, and other intellectual
          property laws.
        </p>

        <h2>7. Content Review</h2>
        <p>
          AssetBox reserves the right to review all uploaded Assets before they are made available
          on the Platform. We may reject any Asset that violates these Terms or our content
          guidelines.
        </p>

        <h2>8. Termination</h2>
        <p>
          We may terminate or suspend your account immediately, without prior notice, if you breach
          these Terms.  Upon termination, your right to use the Platform will cease immediately.
        </p>

        <h2>9. Limitation of Liability</h2>
        <p>
          AssetBox shall not be liable for any indirect, incidental, special, consequential, or
          punitive damages resulting from your use or inability to use the Platform.
        </p>

        <h2>10. Changes to Terms</h2>
        <p>
          We reserve the right to modify these Terms at any time. We will notify users of any
          material changes.  Your continued use of the Platform after such changes constitutes
          acceptance of the new Terms.
        </p>

        <h2>11. Contact Information</h2>
        <p>
          If you have any questions about these Terms, please contact us at support@assetbox.com
        </p>
      </div>
    </div>
  );
}