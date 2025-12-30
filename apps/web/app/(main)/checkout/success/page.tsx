'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Download, ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    // Simulate verification (in production, you might want to verify with backend)
    const timer = setTimeout(() => {
      setIsVerifying(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (! sessionId) {
    router.push('/');
    return null;
  }

  if (isVerifying) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center py-16">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center py-12">
            <Skeleton className="h-16 w-16 rounded-full" />
            <Skeleton className="mt-4 h-8 w-48" />
            <Skeleton className="mt-2 h-4 w-64" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container flex min-h-[60vh] items-center justify-center py-16">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="mt-4 text-2xl">Payment Successful!</CardTitle>
          <CardDescription>
            Your order has been confirmed and you can now download your assets.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-sm">
              <strong>What's next?</strong>
            </p>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li>• Check your email for order confirmation</li>
              <li>• Download your assets from your purchases page</li>
              <li>• You can re-download assets anytime</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Button asChild className="w-full" size="lg">
              <Link href="/dashboard/purchases">
                <Download className="mr-2 h-4 w-4" />
                View My Purchases
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/search">
                Continue Shopping
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Order ID: {sessionId. slice(0, 16)}...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}