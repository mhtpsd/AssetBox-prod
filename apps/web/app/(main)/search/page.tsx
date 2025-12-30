'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { SlidersHorizontal, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { AssetGrid } from '@/components/assets/asset-grid';
import { assetsApi } from '@/lib/api';
import { ASSET_TYPES, CATEGORIES } from '@assetbox/config';
import { useDebouncedCallback } from 'use-debounce';

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'price_asc', label:  'Price:  Low to High' },
  { value:  'price_desc', label: 'Price: High to Low' },
];

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get initial values from URL
  const initialQuery = searchParams.get('q') || '';
  const initialType = searchParams.get('type') || '';
  const initialCategory = searchParams.get('category') || '';
  const initialSort = searchParams.get('sort') || 'relevance';
  const initialMinPrice = parseInt(searchParams.get('minPrice') || '0');
  const initialMaxPrice = parseInt(searchParams. get('maxPrice') || '1000');
  const initialPage = parseInt(searchParams.get('page') || '1');

  // State
  const [query, setQuery] = useState(initialQuery);
  const [assetType, setAssetType] = useState(initialType);
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState(initialSort);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    initialMinPrice,
    initialMaxPrice,
  ]);
  const [page, setPage] = useState(initialPage);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Build query params
  const buildParams = () => {
    const params:  Record<string, any> = { page, limit: 20 };
    if (query) params.query = query;
    if (assetType) params.assetType = assetType;
    if (category) params.category = category;
    if (sort !== 'relevance') params.sort = sort;
    if (priceRange[0] > 0) params.minPrice = priceRange[0];
    if (priceRange[1] < 1000) params.maxPrice = priceRange[1];
    return params;
  };

  // Fetch assets
  const { data, isLoading } = useQuery({
    queryKey: ['search', query, assetType, category, sort, priceRange, page],
    queryFn: async () => {
      const params = buildParams();
      const response = query
        ? await assetsApi.search(query, params)
        : await assetsApi.list(params);
      return response. data;
    },
  });

  // Update URL when filters change
  const updateUrl = useDebouncedCallback(() => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (assetType) params.set('type', assetType);
    if (category) params.set('category', category);
    if (sort !== 'relevance') params.set('sort', sort);
    if (priceRange[0] > 0) params.set('minPrice', priceRange[0]. toString());
    if (priceRange[1] < 1000) params.set('maxPrice', priceRange[1]. toString());
    if (page > 1) params.set('page', page.toString());

    router.push(`/search?${params. toString()}`, { scroll: false });
  }, 500);

  useEffect(() => {
    updateUrl();
  }, [query, assetType, category, sort, priceRange, page]);

  // Count active filters
  const activeFiltersCount = [
    assetType,
    category,
    priceRange[0] > 0 || priceRange[1] < 1000,
  ].filter(Boolean).length;

  // Clear all filters
  const clearFilters = () => {
    setAssetType('');
    setCategory('');
    setPriceRange([0, 1000]);
    setSort('relevance');
    setPage(1);
  };

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          {query ? `Search results for "${query}"` : 'Browse Assets'}
        </h1>
        {data?.total !== undefined && (
          <p className="mt-2 text-muted-foreground">
            {data. total} {data.total === 1 ? 'result' : 'results'} found
          </p>
        )}
      </div>

      {/* Filters Bar */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Input
            placeholder="Search assets..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
              onClick={() => setQuery('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Asset Type */}
        <Select
          value={assetType || 'all'}
          onValueChange={(value) => {
            setAssetType(value === 'all' ?  '' : value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {ASSET_TYPES.map((type) => (
              <SelectItem key={type. value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Category */}
        <Select
          value={category || 'all'}
          onValueChange={(value) => {
            setCategory(value === 'all' ? '' : value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option. label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* More Filters (Mobile) */}
        <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-6">
              {/* Price Range */}
              <div className="space-y-4">
                <Label>Price Range</Label>
                <Slider
                  min={0}
                  max={1000}
                  step={10}
                  value={priceRange}
                  onValueChange={(value) => setPriceRange(value as [number, number])}
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}+</span>
                </div>
              </div>

              {/* Clear & Apply */}
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={clearFilters}>
                  Clear All
                </Button>
                <Button className="flex-1" onClick={() => setFiltersOpen(false)}>
                  Apply
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Clear Filters */}
        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear filters
            <X className="ml-1 h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Results */}
      <AssetGrid
        assets={data?.items || []}
        isLoading={isLoading}
        emptyMessage="No assets match your search criteria.  Try adjusting your filters."
      />

      {/* Pagination */}
      {data?.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="px-4 text-sm text-muted-foreground">
            Page {page} of {data. totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(data. totalPages, p + 1))}
            disabled={page === data.totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}