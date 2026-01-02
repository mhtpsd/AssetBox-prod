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
      <div className="min-h-screen flex items-center justify-center bg-mesh">
        <div className="text-center animate-scale-in">
          <h1 className="text-3xl font-bold text-destructive">Category not found</h1>
          <p className="mt-2 text-muted-foreground">The category you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10 animate-fade-in">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gradient">{category.label}</h1>
            {data?.total !== undefined && (
              <p className="mt-3 text-lg text-muted-foreground">
                {data.total.toLocaleString()} {data.total === 1 ? 'asset' : 'assets'} available
              </p>
            )}
          </div>

          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-[200px] h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Subcategories (if any) */}
        {category.subcategories.length > 0 && (
          <div className="mb-8 p-6 bg-card rounded-2xl border shadow-lg animate-slide-up">
            <h3 className="text-sm font-semibold text-muted-foreground mb-4">SUBCATEGORIES</h3>
            <div className="flex flex-wrap gap-3">
              {category.subcategories.map((sub) => (
                <Button key={sub} variant="outline" size="lg" className="rounded-full hover-lift">
                  {sub}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Assets Grid */}
        <div className="animate-fade-in">
          <AssetGrid assets={data?.items || []} isLoading={isLoading} />
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-3 animate-slide-up">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-11 px-6"
            >
              Previous
            </Button>
            <div className="px-6 py-2 bg-card border rounded-lg">
              <span className="text-sm font-medium">
                Page <span className="text-primary font-bold">{page}</span> of {data.totalPages}
              </span>
            </div>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={page === data.totalPages}
              className="h-11 px-6"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}