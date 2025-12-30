'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, ArrowLeft, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { assetsApi } from '@/lib/api';
import { ASSET_TYPES, CATEGORIES, LICENSE_TYPES } from '@assetbox/config';

const editSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(5000),
  category: z.string().min(1),
  subcategory: z.string().optional(),
  tags: z.string().optional(),
  price: z.number().min(0).max(10000),
  licenseType: z.enum(['STANDARD', 'COMMERCIAL', 'EXTENDED']),
});

type EditFormData = z.infer<typeof editSchema>;

export default function EditAssetPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const assetId = params.id as string;

  const { data: asset, isLoading } = useQuery({
    queryKey: ['asset', assetId],
    queryFn: async () => {
      const response = await assetsApi.get(assetId);
      return response.data;
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
  });

  // Populate form when asset loads
  useEffect(() => {
    if (asset) {
      reset({
        title: asset.title,
        description: asset.description,
        category: asset.category,
        subcategory: asset. subcategory || '',
        tags: asset.tags?. join(', ') || '',
        price: asset.price,
        licenseType: asset.licenseType as any,
      });
    }
  }, [asset, reset]);

  const updateMutation = useMutation({
    mutationFn: async (data: EditFormData) => {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data. description);
      formData.append('category', data.category);
      if (data.subcategory) formData.append('subcategory', data.subcategory);
      if (data.tags) formData.append('tags', data.tags);
      formData.append('price', data.price.toString());
      formData.append('licenseType', data.licenseType);

      await assetsApi.update(assetId, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset', assetId] });
      queryClient.invalidateQueries({ queryKey: ['my-uploads'] });
      toast.success('Asset updated successfully');
      router.push('/dashboard/uploads');
    },
    onError: (error:  any) => {
      toast.error(error.message || 'Failed to update asset');
    },
  });

  const onSubmit = (data: EditFormData) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">Asset not found</p>
      </div>
    );
  }

  // Check if asset can be edited
  if (! ['DRAFT', 'REJECTED'].includes(asset.status)) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">
          This asset cannot be edited in its current status:  {asset.status}
        </p>
        <Button onClick={() => router.push('/dashboard/uploads')}>
          Back to Uploads
        </Button>
      </div>
    );
  }

  const selectedCategory = watch('category');
  const categoryData = CATEGORIES.find((c) => c.value === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/dashboard/uploads')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Asset</h1>
          <p className="mt-1 text-muted-foreground">
            Update your asset details
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Asset Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                {... register('title')}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                rows={5}
                {...register('description')}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            {/* Category & Subcategory */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select
                  value={watch('category')}
                  onValueChange={(value) => {
                    setValue('category', value);
                    setValue('subcategory', '');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-destructive">{errors. category.message}</p>
                )}
              </div>

              {categoryData && categoryData.subcategories.length > 0 && (
                <div className="space-y-2">
                  <Label>Subcategory</Label>
                  <Select
                    value={watch('subcategory')}
                    onValueChange={(value) => setValue('subcategory', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryData.subcategories.map((sub) => (
                        <SelectItem key={sub} value={sub. toLowerCase()}>
                          {sub}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                placeholder="nature, sunset, mountains (comma separated)"
                {... register('tags')}
              />
            </div>

            {/* Price & License */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">Price (USD) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  {...register('price', { valueAsNumber: true })}
                />
                {errors. price && (
                  <p className="text-sm text-destructive">{errors.price.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>License Type *</Label>
                <Select
                  value={watch('licenseType')}
                  onValueChange={(value:  any) => setValue('licenseType', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LICENSE_TYPES.map((license) => (
                      <SelectItem key={license. value} value={license.value}>
                        {license.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.licenseType && (
                  <p className="text-sm text-destructive">{errors.licenseType. message}</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard/uploads')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation. isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}