'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

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
import { useUploadStore } from '@/stores/upload-store';
import { ASSET_TYPES, CATEGORIES } from '@assetbox/config';

const detailsSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000),
  assetType: z. string().min(1, 'Please select an asset type'),
  category: z.string().min(1, 'Please select a category'),
  subcategory: z. string().optional(),
  tags: z.string().optional(),
});

type DetailsFormData = z.infer<typeof detailsSchema>;

export function StepDetails() {
  const {
    title,
    description,
    assetType,
    category,
    subcategory,
    tags,
    setDetails,
    nextStep,
    prevStep,
  } = useUploadStore();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DetailsFormData>({
    resolver: zodResolver(detailsSchema),
    defaultValues: {
      title,
      description,
      assetType:  assetType || '',
      category,
      subcategory,
      tags:  tags?. join(', ') || '',
    },
  });

  const selectedCategory = watch('category');
  const categoryData = CATEGORIES. find((c) => c.value === selectedCategory);

  const onSubmit = (data: DetailsFormData) => {
    setDetails({
      title: data.title,
      description: data.description,
      assetType: data.assetType as any,
      category: data.category,
      subcategory: data.subcategory || '',
      tags: data.tags
        ?  data.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [],
    });
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Asset Details</h2>
        <p className="mt-1 text-muted-foreground">
          Provide information about your asset to help buyers find it.
        </p>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          placeholder="e.g., Mountain Sunset Photography"
          {...register('title')}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors. title.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          rows={5}
          placeholder="Describe your asset in detail.  What's included? How can it be used?"
          {...register('description')}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      {/* Asset Type & Category */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Asset Type *</Label>
          <Select
            value={watch('assetType')}
            onValueChange={(value) => setValue('assetType', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {ASSET_TYPES. map((type) => (
                <SelectItem key={type. value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.assetType && (
            <p className="text-sm text-destructive">{errors.assetType.message}</p>
          )}
        </div>

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
              <SelectValue placeholder="Select category" />
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
            <p className="text-sm text-destructive">{errors.category.message}</p>
          )}
        </div>
      </div>

      {/* Subcategory */}
      {categoryData && categoryData.subcategories. length > 0 && (
        <div className="space-y-2">
          <Label>Subcategory</Label>
          <Select
            value={watch('subcategory')}
            onValueChange={(value) => setValue('subcategory', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select subcategory (optional)" />
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

      {/* Tags */}
      <div className="space-y-2">
        <Label htmlFor="tags">Tags</Label>
        <Input
          id="tags"
          placeholder="nature, sunset, mountains (comma separated)"
          {...register('tags')}
        />
        <p className="text-xs text-muted-foreground">
          Add relevant tags to help buyers discover your asset
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={prevStep}>
          Back
        </Button>
        <Button type="submit">Continue</Button>
      </div>
    </form>
  );
}