# Stripe Setup Instructions

## 1. Get Your Stripe Keys

1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy your **Secret key** (starts with `sk_test_`)
3. Add it to `apps/api/.env`:


## 2. Set Up Webhook for Local Development

### Using Stripe CLI (Recommended)

1. Install Stripe CLI:
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows
scoop install stripe

# Linux
# Download from https://github.com/stripe/stripe-cli/releases

2. Login to Stripe:
stripe login

3. Forward webhooks to your local server:
stripe listen --forward-to localhost:3001/api/payments/webhook

4. Copy the webhook signing secret (starts with whsec_) and add to .env:
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

5. Keep the stripe listen command running while developing

Testing Webhooks

Trigger a test checkout completed event:
stripe trigger checkout.session.completed

3. Production Webhook Setup
Go to https://dashboard.stripe.com/webhooks
Click Add endpoint
Enter your URL: https://yourdomain.com/api/payments/webhook
Select events to listen to:
checkout.session.completed
checkout.session.expired
Copy the webhook signing secret
Add to production environment variables
4. Test the Integration
Start your development servers:

bash
npm run dev
Start Stripe webhook forwarding:

bash
stripe listen --forward-to localhost: 3001/api/payments/webhook
Add an asset to cart and proceed to checkout

Use Stripe test card: 4242 4242 4242 4242

Any expiry date in the future

Any 3-digit CVC

Complete the payment

Check that:

Order is created in database
User receives download access
Creator receives earnings
Emails are sent
5. Stripe Test Cards
Card Number	Description
4242 4242 4242 4242	Succeeds
4000 0000 0000 0002	Card declined
4000 0025 0000 3155	Requires authentication
More test cards: https://stripe.com/docs/testing

Code

---

## 19. Add Download Button to Asset Detail Page

Update the asset detail page to show download button if user owns it:

```typescript name=apps/web/src/app/(main)/assets/[id]/page.tsx
// Add this query to check if user owns the asset
async function checkOwnership(assetId: string, userId?:  string) {
  if (!userId) return false;
  
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/downloads/my-assets`,
      { 
        headers: { 'Cookie': `next-auth.session-token=${userId}` },
        cache: 'no-store'
      }
    );
    
    if (res.ok) {
      const data = await res.json();
      return data.data.items.some((item: any) => item.id === assetId);
    }
  } catch {}
  
  return false;
}

// Then in the component, replace the purchase card with:
{/* Purchase/Download Card */}
<div className="sticky top-24 rounded-lg border bg-card p-6">
  {ownsAsset ?  (
    <DownloadButton assetId={asset.id} />
  ) : (
    <AddToCartButton assetId={asset. id} isFree={isFree} />
  )}
  {/* ... rest of the card ...  */}
</div>