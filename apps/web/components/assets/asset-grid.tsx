'use client';

import { AssetCard } from './asset-card';
import { AssetGridSkeleton } from '@/components/shared/loading-skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { Package } from 'lucide-react';

interface Asset {
  id:  string;
  title: string;
  price: number;
  thumbnailUrl: string | null;
  assetType: string;
  category: string;
  totalDownloads: number;
  viewCount: number;
  owner: {
    username: string;
    profileImage: string | null;
  };
}

interface AssetGridProps {
  assets: Asset[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export function AssetGrid({ assets, isLoading, emptyMessage }:  AssetGridProps) {
  if (isLoading) {
    return <AssetGridSkeleton count={8} />;
  }

  if (! assets || assets.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No assets found"
        description={emptyMessage || "We couldn't find any assets matching your criteria."}
      />
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {assets.map((asset) => (
        <AssetCard key={asset.id} asset={asset} />
      ))}
    </div>
  );
}