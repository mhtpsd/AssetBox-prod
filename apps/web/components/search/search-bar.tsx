'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { useDebouncedCallback } from 'use-debounce';

const ASSET_TYPES = ['IMAGE', 'VIDEO', 'AUDIO', 'TEXT', 'TWO_D', 'THREE_D'];
const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'price_asc', label:  'Price:  Low to High' },
  { value: 'price_desc', label: 'Price:  High to Low' },
];

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [assetType, setAssetType] = useState(searchParams.get('type') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'relevance');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const updateSearchParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      router.push(`/search?${params. toString()}`);
    },
    [router, searchParams]
  );

  const debouncedSearch = useDebouncedCallback((value:  string) => {
    updateSearchParams({ q: value || null });
  }, 300);

  const handleQueryChange = (e: React. ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    debouncedSearch(e. target.value);
  };

  const handleTypeChange = (value: string) => {
    setAssetType(value);
    updateSearchParams({ type: value === 'all' ? null : value });
  };

  const handleSortChange = (value:  string) => {
    setSort(value);
    updateSearchParams({ sort: value === 'relevance' ? null : value });
  };

  const handlePriceApply = () => {
    updateSearchParams({
      minPrice: priceRange[0] > 0 ? priceRange[0]. toString() : null,
      maxPrice: priceRange[1] < 500 ? priceRange[1].toString() : null,
    });
    setFiltersOpen(false);
  };

  const clearFilters = () => {
    setAssetType('');
    setSort('relevance');
    setPriceRange([0, 500]);
    router.push(`/search?q=${query}`);
  };

  const activeFiltersCount = [
    assetType,
    sort !== 'relevance' ? sort : null,
    priceRange[0] > 0 || priceRange[1] < 500 ? 'price' : null,
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Search input row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search assets..."
            value={query}
            onChange={handleQueryChange}
            className="pl-10"
          />
          {query && (
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
              onClick={() => {
                setQuery('');
                updateSearchParams({ q:  null });
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Filters popover */}
        <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              {/* Price range */}
              <div className="space-y-2">
                <Label>Price Range</Label>
                <Slider
                  min={0}
                  max={500}
                  step={10}
                  value={priceRange}
                  onValueChange={(value) => setPriceRange(value as [number, number])}
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}+</span>
                </div>
              </div>

              {/* Apply button */}
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={clearFilters}>
                  Clear
                </Button>
                <Button className="flex-1" onClick={handlePriceApply}>
                  Apply
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Filter chips row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Asset type */}
        <Select value={assetType || 'all'} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {ASSET_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type. replace('_', ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select value={sort} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS. map((option) => (
              <SelectItem key={option. value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Active filters display */}
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground"
          >
            Clear all
            <X className="ml-1 h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}