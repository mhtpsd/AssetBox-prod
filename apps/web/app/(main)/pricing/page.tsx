import { Metadata } from 'next';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata:  Metadata = {
  title: 'Pricing & Fees',
  description: 'AssetBox pricing, commission rates, and fees',
};

export default function PricingPage() {
  return (
    <div className="container max-w-6xl py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Simple, Transparent Pricing</h1>
        <p className="mt-4 text-xl text-muted-foreground">
          No hidden fees.  No monthly subscriptions. Pay only when you sell.
        </p>
      </div>

      {/* For Creators */}
      <div className="mt-16">
        <h2 className="text-center text-3xl font-bold">For Creators</h2>
        <div className="mx-auto mt-8 max-w-2xl rounded-lg border-2 border-primary bg-card p-8">
          <div className="text-center">
            <p className="text-6xl font-bold text-primary">10%</p>
            <p className="mt-2 text-xl font-semibold">Commission Fee</p>
            <p className="mt-4 text-muted-foreground">
              That's it. You keep 90% of every sale.  Forever.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            <div className="flex items-start gap-3">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
              <div>
                <p className="font-medium">No Setup Fees</p>
                <p className="text-sm text-muted-foreground">
                  Create your account and start selling immediately
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
              <div>
                <p className="font-medium">No Monthly Fees</p>
                <p className="text-sm text-muted-foreground">
                  No subscription required. Pay only when you sell
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
              <div>
                <p className="font-medium">No Listing Fees</p>
                <p className="text-sm text-muted-foreground">
                  Upload unlimited assets at no cost
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
              <div>
                <p className="font-medium">$50 Minimum Payout</p>
                <p className="text-sm text-muted-foreground">
                  Request payout once you reach $50 in earnings
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
              <div>
                <p className="font-medium">Fast Payments</p>
                <p className="text-sm text-muted-foreground">
                  Receive your payout within 5-7 business days
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Button size="lg" asChild>
              <Link href="/login">Start Selling Today</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* For Buyers */}
      <div className="mt-16">
        <h2 className="text-center text-3xl font-bold">For Buyers</h2>
        <div className="mx-auto mt-8 max-w-2xl rounded-lg border bg-card p-8">
          <div className="text-center">
            <p className="text-xl font-semibold">Pay Only for What You Need</p>
            <p className="mt-4 text-muted-foreground">
              No subscriptions or memberships required. Buy individual assets as you need them.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            <div className="flex items-start gap-3">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
              <p>Set your own price for assets you upload</p>
            </div>
            <div className="flex items-start gap-3">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
              <p>Free assets available</p>
            </div>
            <div className="flex items-start gap-3">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
              <p>Secure payment processing via Stripe</p>
            </div>
            <div className="flex items-start gap-3">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
              <p>Instant download after purchase</p>
            </div>
            <div className="flex items-start gap-3">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
              <p>Redownload anytime from your library</p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Button size="lg" variant="outline" asChild>
              <Link href="/search">Browse Assets</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="prose prose-gray mx-auto mt-16 dark: prose-invert max-w-3xl">
        <h2>Frequently Asked Questions</h2>

        <h3>How do payouts work?</h3>
        <p>
          Once your earnings reach $50, you can request a payout. We process payouts within 5-7
          business days of approval.  Payments are sent via your preferred payment method.
        </p>

        <h3>Are there any hidden fees?</h3>
        <p>
          No.  The only fee is our 10% commission on sales. There are no setup fees, monthly fees,
          listing fees, or withdrawal fees.
        </p>

        <h3>What payment methods do you accept?</h3>
        <p>
          We use Stripe for secure payment processing, which accepts all major credit cards, debit
          cards, and various local payment methods.
        </p>

        <h3>Can I change my asset prices?</h3>
        <p>
          Yes, you can update your asset prices at any time from your dashboard. Price changes take
          effect immediately. 
        </p>

        <h3>What happens if a buyer requests a refund?</h3>
        <p>
          All sales are final. We do not offer refunds due to the digital nature of our products.
          Buyers can preview assets before purchasing.
        </p>
      </div>
    </div>
  );
}