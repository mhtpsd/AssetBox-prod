'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';

import { AssetGrid } from '@/components/assets/asset-grid';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { assetsApi } from '@/lib/api';
import { CATEGORIES } from '@assetbox/config';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most Popular' },
  { value:  'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('newest');

  const category = CATEGORIES.find((c) => c.value === slug);

  const { data, isLoading } = useQuery({
    queryKey: ['category-assets', slug, sort, page],
    queryFn:  async () => {
      const response = await assetsApi.list({
        category: slug,
        sort,
        page,
        limit: 20,
      });
      return response.data;
    },
  });

  if (!category) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-2xl font-bold">Category not found</h1>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{category.label}</h1>
          {data?.total !== undefined && (
            <p className="mt-1 text-muted-foreground">
              {data.total} {data.total === 1 ? 'asset' : 'assets'}
            </p>
          )}
        </div>

        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS. map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Subcategories (if any) */}
      {category.subcategories. length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {category.subcategories. map((sub) => (
            <Button key={sub} variant="outline" size="sm">
              {sub}
            </Button>
          ))}
        </div>
      )}

      {/* Assets Grid */}
      <div className="mt-8">
        <AssetGrid assets={data?.items || []} isLoading={isLoading} />
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="px-4 text-sm text-muted-foreground">
            Page {page} of {data.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page === data. totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}