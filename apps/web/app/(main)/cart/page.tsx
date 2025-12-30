'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, ShoppingBag, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { EmptyState } from '@/components/shared/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { cartApi } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<string | null>(null);

  // Redirect if not authenticated
  if (status === 'unauthenticated') {
    router.push('/login? callbackUrl=/cart');
    return null;
  }

  // Fetch cart
  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const { data } = await cartApi.get();
      return data;
    },
    enabled: !!session?.user,
  });

  // Remove item mutation
  const removeItemMutation = useMutation({
    mutationFn: async (assetId: string) => {
      await cartApi.removeItem(assetId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Item removed from cart');
      setRemoveDialogOpen(false);
      setItemToRemove(null);
    },
    onError: () => {
      toast.error('Failed to remove item');
    },
  });

  // Checkout mutation
  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const { data } = await cartApi.checkout();
      return data;
    },
    onSuccess: (data) => {
      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data. url;
      }
    },
    onError: () => {
      toast.error('Failed to start checkout');
    },
  });

  const handleRemoveClick = (assetId: string) => {
    setItemToRemove(assetId);
    setRemoveDialogOpen(true);
  };

  const handleRemoveConfirm = () => {
    if (itemToRemove) {
      removeItemMutation.mutate(itemToRemove);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-8 w-48" />
        <div className="mt-8 space-y-4">
          {Array. from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Add some assets to your cart to get started."
          action={{
            label: 'Browse Assets',
            onClick: () => router.push('/search'),
          }}
        />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
          <p className="mt-1 text-muted-foreground">
            {cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'}
          </p>

          <div className="mt-8 space-y-4">
            {cart.items.map((item: any) => (
              <div
                key={item.id}
                className="flex gap-4 rounded-lg border bg-card p-4"
              >
                <Link
                  href={`/assets/${item.assetId}`}
                  className="relative h-24 w-24 shrink-0 overflow-hidden rounded bg-muted"
                >
                  {item.asset.thumbnailUrl ? (
                    <Image
                      src={item. asset.thumbnailUrl}
                      alt={item.asset.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                      No image
                    </div>
                  )}
                </Link>

                <div className="flex flex-1 flex-col">
                  <Link
                    href={`/assets/${item.assetId}`}
                    className="font-medium hover:text-primary"
                  >
                    {item.asset.title}
                  </Link>
                  <p className="mt-1 text-sm text-muted-foreground">
                    by {item.asset.owner.username}
                  </p>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-lg font-bold">
                      {formatPrice(item.asset.price)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => handleRemoveClick(item.assetId)}
                      disabled={removeItemMutation.isPending}
                    >
                      <Trash2 className="mr-1 h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div className="sticky top-24 rounded-lg border bg-card p-6">
            <h2 className="text-xl font-semibold">Order Summary</h2>

            <div className="mt-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(cart.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Taxes</span>
                <span>Calculated at checkout</span>
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatPrice(cart.totalAmount)}</span>
              </div>
            </div>

            <Button
              className="mt-6 w-full"
              size="lg"
              onClick={() => checkoutMutation.mutate()}
              disabled={checkoutMutation.isPending}
            >
              {checkoutMutation. isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing... 
                </>
              ) : (
                <>
                  Proceed to Checkout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              All sales are final. No refunds. 
            </p>
          </div>
        </div>
      </div>

      {/* Remove Confirmation Dialog */}
      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from cart? </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this item from your cart?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveConfirm}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}