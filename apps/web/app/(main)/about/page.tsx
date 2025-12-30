import { Metadata } from 'next';
import { Target, Users, Shield, Zap } from 'lucide-react';

export const metadata:  Metadata = {
  title:  'About Us',
  description: 'Learn about AssetBox and our mission',
};

export default function AboutPage() {
  return (
    <div className="container max-w-6xl py-12">
      {/* Hero */}
      <div className="text-center">
        <h1 className="text-4xl font-bold">About AssetBox</h1>
        <p className="mt-4 text-xl text-muted-foreground">
          Empowering creators and businesses with quality digital assets
        </p>
      </div>

      {/* Mission */}
      <div className="mt-16">
        <div className="rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 p-8 text-center">
          <h2 className="text-3xl font-bold">Our Mission</h2>
          <p className="mx-auto mt-4 max-w-3xl text-lg text-muted-foreground">
            To create a fair and transparent marketplace where creators can monetize their work and
            buyers can access high-quality digital assets with confidence.
          </p>
        </div>
      </div>

      {/* Values */}
      <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Target className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mt-4 text-xl font-semibold">Quality First</h3>
          <p className="mt-2 text-muted-foreground">
            Every asset is reviewed to ensure it meets our quality standards
          </p>
        </div>

        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mt-4 text-xl font-semibold">Creator Focused</h3>
          <p className="mt-2 text-muted-foreground">
            Fair commission rates and fast payouts for our creators
          </p>
        </div>

        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mt-4 text-xl font-semibold">Safe & Secure</h3>
          <p className="mt-2 text-muted-foreground">
            Verified ownership and secure payment processing
          </p>
        </div>

        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Zap className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mt-4 text-xl font-semibold">Instant Access</h3>
          <p className="mt-2 text-muted-foreground">
            Download your purchases immediately after payment
          </p>
        </div>
      </div>

      {/* Story */}
      <div className="prose prose-gray mx-auto mt-16 dark:prose-invert max-w-3xl">
        <h2>Our Story</h2>
        <p>
          AssetBox was founded in 2024 with a simple vision: to create a marketplace where digital
          creators could thrive. We saw a need for a platform that treated creators fairly, valued
          quality over quantity, and made it easy for businesses to find the assets they need.
        </p>

        <p>
          Today, AssetBox serves thousands of creators and buyers worldwide. Our platform handles
          everything from secure payments to instant downloads, allowing creators to focus on what
          they do best—creating amazing digital assets.
        </p>

        <h2>Why Choose AssetBox?</h2>
        <ul>
          <li>
            <strong>Only 10% commission</strong> - Keep 90% of your sales revenue
          </li>
          <li>
            <strong>Quality Review</strong> - All assets are reviewed before going live
          </li>
          <li>
            <strong>Ownership Protection</strong> - We verify creators own their work
          </li>
          <li>
            <strong>Fast Payouts</strong> - Request payouts anytime you reach $50
          </li>
          <li>
            <strong>No Subscription</strong> - Pay only when you sell
          </li>
        </ul>

        <h2>Join Our Community</h2>
        <p>
          Whether you're a creator looking to monetize your work or a business seeking quality
          digital assets, AssetBox is here to help you succeed. Join thousands of satisfied users
          today. 
        </p>
      </div>
    </div>
  );
}