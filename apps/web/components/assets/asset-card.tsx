'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, Download, Eye, ShoppingCart } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useCartStore } from '@/stores/cart-store';
import { useSession } from 'next-auth/react';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

interface AssetCardProps {
  asset: {
    id: string;
    title:  string;
    price: number;
    thumbnailUrl: string | null;
    assetType: string;
    category:  string;
    totalDownloads: number;
    viewCount: number;
    owner: {
      username: string | null;
      image:  string | null;
    };
  };
  className?: string;
}

export function AssetCard({ asset, className }: AssetCardProps) {
  const { data: session } = useSession();
  const { addItem, items } = useCartStore();

  const isInCart = items.some((item) => item.assetId === asset. id);
  const isFree = asset.price === 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (! isInCart && !isFree) {
      await addItem(asset.id);
    }
  };

  return (
    <Link href={`/assets/${asset.id}`}>
      <Card
        className={cn(
          'group overflow-hidden transition-all hover:shadow-lg',
          className
        )}
      >
        {/* Thumbnail */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {asset.thumbnailUrl ?  (
            <Image
              src={asset.thumbnailUrl}
              alt={asset.title}
              fill
              className="object-cover transition-transform duration-300 group-hover: scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-muted-foreground">No preview</span>
            </div>
          )}

          {/* Asset type badge */}
          <Badge
            className="absolute left-2 top-2"
            variant="secondary"
          >
            {asset.assetType. replace('_', ' ')}
          </Badge>

          {/* Quick actions overlay */}
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
            <Button size="icon" variant="secondary" className="h-9 w-9">
              <Eye className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="secondary" className="h-9 w-9">
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <CardContent className="p-4">
          {/* Title */}
          <h3 className="line-clamp-1 font-semibold group-hover:text-primary transition-colors">
            {asset.title}
          </h3>

          {/* Creator */}
          <p className="mt-1 text-sm text-muted-foreground">
            by {asset.owner. username || 'Unknown'}
          </p>

          {/* Stats */}
          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Download className="h-3 w-3" />
              {formatNumber(asset.totalDownloads)}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {formatNumber(asset.viewCount)}
            </span>
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t p-4">
          {/* Price */}
          <span className="text-lg font-bold">
            {isFree ? 'Free' : formatPrice(asset.price)}
          </span>

          {/* Add to cart button */}
          {session?. user && ! isFree && (
            <Button
              size="sm"
              variant={isInCart ?  'secondary' : 'default'}
              onClick={handleAddToCart}
              disabled={isInCart}
            >
              {isInCart ? (
                'In Cart'
              ) : (
                <>
                  <ShoppingCart className="mr-1 h-3 w-3" />
                  Add
                </>
              )}
            </Button>
          )}

          {isFree && (
            <Button size="sm" variant="outline">
              <Download className="mr-1 h-3 w-3" />
              Free
            </Button>
          )}

          {! session?.user && ! isFree && (
            <Button size="sm" variant="default">
              <ShoppingCart className="mr-1 h-3 w-3" />
              Add
            </Button>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}