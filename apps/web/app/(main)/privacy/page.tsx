import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'AssetBox Privacy Policy and Data Protection',
};

export default function PrivacyPage() {
  return (
    <div className="container max-w-4xl py-12">
      <h1 className="text-4xl font-bold">Privacy Policy</h1>
      <p className="mt-4 text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

      <div className="prose prose-gray mt-8 dark:prose-invert max-w-none">
        <h2>1. Information We Collect</h2>
        
        <h3>1.1 Information You Provide</h3>
        <p>We collect information you provide directly to us, including:</p>
        <ul>
          <li>Account information (name, email address, username)</li>
          <li>Profile information (bio, profile picture)</li>
          <li>Payment information (processed securely through Stripe)</li>
          <li>Content you upload (digital assets, descriptions, tags)</li>
          <li>Communications with support</li>
        </ul>

        <h3>1.2 Automatically Collected Information</h3>
        <p>When you use our Platform, we automatically collect: </p>
        <ul>
          <li>Usage information (pages viewed, features used)</li>
          <li>Device information (browser type, operating system)</li>
          <li>Log data (IP address, access times)</li>
          <li>Cookies and similar technologies</li>
        </ul>

        <h2>2. How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Provide, maintain, and improve the Platform</li>
          <li>Process transactions and send related information</li>
          <li>Send you technical notices and support messages</li>
          <li>Respond to your comments and questions</li>
          <li>Detect, prevent, and address fraud and security issues</li>
          <li>Comply with legal obligations</li>
        </ul>

        <h2>3. Information Sharing</h2>
        <p>We do not sell your personal information.  We may share information: </p>
        <ul>
          <li>With service providers who perform services on our behalf</li>
          <li>When required by law or to protect rights and safety</li>
          <li>With your consent or at your direction</li>
          <li>In connection with a business transfer (merger, acquisition)</li>
        </ul>

        <h2>4. Data Security</h2>
        <p>
          We implement appropriate technical and organizational measures to protect your personal
          information against unauthorized access, alteration, disclosure, or destruction.
        </p>

        <h2>5. Data Retention</h2>
        <p>
          We retain your information for as long as your account is active or as needed to provide
          services.  You may request deletion of your account and data at any time.
        </p>

        <h2>6. Your Rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li>Access your personal information</li>
          <li>Correct inaccurate information</li>
          <li>Request deletion of your information</li>
          <li>Object to processing of your information</li>
          <li>Export your data</li>
        </ul>

        <h2>7. Cookies</h2>
        <p>
          We use cookies and similar technologies to provide functionality, analyze usage, and
          improve your experience. You can control cookies through your browser settings.
        </p>

        <h2>8. Third-Party Services</h2>
        <p>Our Platform uses third-party services including:</p>
        <ul>
          <li>Stripe for payment processing</li>
          <li>AWS/MinIO for file storage</li>
          <li>Email service providers for communications</li>
        </ul>

        <h2>9. Children's Privacy</h2>
        <p>
          Our Platform is not directed to children under 13. We do not knowingly collect personal
          information from children under 13.
        </p>

        <h2>10. International Data Transfers</h2>
        <p>
          Your information may be transferred to and maintained on servers located outside your
          country.  We ensure appropriate safeguards are in place for such transfers.
        </p>

        <h2>11. Changes to Privacy Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify you of any material
          changes by posting the new policy on this page.
        </p>

        <h2>12. Contact Us</h2>
        <p>
          If you have questions about this Privacy Policy, please contact us at privacy@assetbox.com
        </p>
      </div>
    </div>
  );
}