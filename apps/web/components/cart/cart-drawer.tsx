'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ShoppingCart, X, Trash2, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useCartStore } from '@/stores/cart-store';
import { useCheckout } from '@/hooks/use-commerce';
import { formatPrice } from '@/lib/utils';

export function CartDrawer() {
  const router = useRouter();
  const { 
    items, 
    isOpen, 
    closeCart, 
    removeItem, 
    totalAmount,
    itemCount,
  } = useCartStore();

  const checkoutMutation = useCheckout();

  const handleCheckout = () => {
    closeCart();
    router.push('/cart');
  };

  return (
    <Sheet open={isOpen} onOpenChange={closeCart}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Cart ({itemCount()})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <ShoppingCart className="h-16 w-16 text-muted-foreground" />
            <p className="text-muted-foreground">Your cart is empty</p>
            <Button variant="outline" onClick={closeCart}>
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 py-4">
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    {/* Thumbnail */}
                    <div className="relative h-16 w-16 overflow-hidden rounded-md bg-muted">
                      {item. asset.thumbnailUrl ?  (
                        <Image
                          src={item.asset.thumbnailUrl}
                          alt={item.asset.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                          No image
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex flex-1 flex-col">
                      <h4 className="line-clamp-1 font-medium">
                        {item.asset. title}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        by {item.asset.owner.username}
                      </p>
                      <p className="mt-auto font-semibold">
                        {formatPrice(item.asset.price)}
                      </p>
                    </div>

                    {/* Remove button */}
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeItem(item.assetId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <Separator />

            <SheetFooter className="flex-col gap-4 pt-4">
              {/* Total */}
              <div className="flex items-center justify-between text-lg font-semibold">
                <span>Total</span>
                <span>{formatPrice(totalAmount())}</span>
              </div>

              {/* Checkout button */}
              <Button
                className="w-full"
                size="lg"
                onClick={handleCheckout}
              >
                Go to Checkout
              </Button>

              {/* No refund notice */}
              <p className="text-center text-xs text-muted-foreground">
                All sales are final. No refunds. 
              </p>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}