'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Download, Loader2, Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cart-store';
import { toast } from 'sonner';

interface AddToCartButtonProps {
  assetId: string;
  isFree: boolean;
}

export function AddToCartButton({ assetId, isFree }:  AddToCartButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { items, addItem, isLoading } = useCartStore();

  const isInCart = items.some((item) => item.assetId === assetId);

  const handleClick = async () => {
    if (! session?.user) {
      router.push('/login? callbackUrl=' + encodeURIComponent(`/assets/${assetId}`));
      return;
    }

    if (isFree) {
      // For free assets, trigger download directly
      toast.info('Downloading free asset...');
      // TODO: Implement free download
      return;
    }

    if (isInCart) {
      router.push('/cart');
      return;
    }

    await addItem(assetId);
  };

  if (isFree) {
    return (
      <Button onClick={handleClick} className="w-full" size="lg">
        <Download className="mr-2 h-4 w-4" />
        Download Free
      </Button>
    );
  }

  if (isInCart) {
    return (
      <Button onClick={handleClick} className="w-full" size="lg" variant="secondary">
        <Check className="mr-2 h-4 w-4" />
        View in Cart
      </Button>
    );
  }

  return (
    <Button onClick={handleClick} className="w-full" size="lg" disabled={isLoading}>
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <ShoppingCart className="mr-2 h-4 w-4" />
      )}
      Add to Cart
    </Button>
  );
}