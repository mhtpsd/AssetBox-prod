'use client';

import { useState } from 'react';
import { Loader2, Check, FileIcon, Image, Video, Music, FileText, Box } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useUploadStore } from '@/stores/upload-store';
import { formatPrice } from '@/lib/utils';
import { PLATFORM, LICENSE_TYPES, ASSET_TYPES, CATEGORIES } from '@assetbox/config';
import { assetsApi } from '@/lib/api';

const assetTypeIcons:  Record<string, any> = {
  IMAGE: Image,
  VIDEO: Video,
  AUDIO: Music,
  TEXT: FileText,
  TWO_D: Image,
  THREE_D: Box,
};

interface StepReviewProps {
  onComplete: () => void;
}

const bytesToSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
};

export function StepReview({ onComplete }: StepReviewProps) {
  const {
    files,
    title,
    description,
    assetType,
    category,
    subcategory,
    tags,
    price,
    licenseType,
    proofType,
    proofData,
    prevStep,
    setStep,
  } = useUploadStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const assetTypeLabel = ASSET_TYPES. find((t) => t.value === assetType)?.label || assetType;
  const categoryLabel = CATEGORIES.find((c) => c.value === category)?.label || category;
  const licenseLabel = LICENSE_TYPES.find((l) => l.value === licenseType)?.label || licenseType;

  const platformFee = price * (PLATFORM. COMMISSION_PERCENT / 100);
  const earnings = price - platformFee;

  const Icon = assetTypeIcons[assetType || 'IMAGE'] || FileIcon;

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Create FormData
      const formData = new FormData();
      
      // Add files
      files.forEach((file) => {
        formData.append('files', file);
      });

      // Add asset data
      formData.append('title', title);
      formData.append('description', description);
      formData.append('assetType', assetType || 'IMAGE');
      formData.append('category', category);
      if (subcategory) formData.append('subcategory', subcategory);
      if (tags && tags.length > 0) formData.append('tags', tags.join(','));
      formData.append('licenseType', licenseType);
      formData.append('price', price. toString());

      // Create asset
      const { data: asset } = await assetsApi. create(formData);

      // Submit for review with proof
      await assetsApi.submit(asset.id, {
        type: proofType,
        data: proofData,
      });

      setIsSubmitted(true);
      toast.success('Asset submitted for review!');

      // Wait a moment before redirecting
      setTimeout(() => {
        onComplete();
      }, 2000);
    } catch (error:  any) {
      toast.error(error.message || 'Failed to submit asset');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success State
  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <Check className="h-10 w-10 text-green-600" />
        </div>
        <h2 className="mt-6 text-2xl font-bold">Asset Submitted! </h2>
        <p className="mt-2 max-w-md text-muted-foreground">
          Your asset has been submitted for review.  Our team will review it within
          24-48 hours.  You'll receive a notification once it's approved.
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          Redirecting to your uploads...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Review & Submit</h2>
        <p className="mt-1 text-muted-foreground">
          Review your asset details before submitting for review.
        </p>
      </div>

      {/* Preview Card */}
      <div className="overflow-hidden rounded-lg border">
        {/* Header */}
        <div className="flex items-start gap-4 bg-muted/50 p-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-background">
            <Icon className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{title}</h3>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{assetTypeLabel}</Badge>
              <Badge variant="outline">{categoryLabel}</Badge>
              {subcategory && <Badge variant="outline">{subcategory}</Badge>}
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">
              {price === 0 ? 'Free' : formatPrice(price)}
            </p>
            <p className="text-sm text-muted-foreground">{licenseLabel}</p>
          </div>
        </div>

        <Separator />

        {/* Details */}
        <div className="p-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
                <p className="mt-1 text-sm line-clamp-3">{description}</p>
                <Button
                  variant="link"
                  className="h-auto p-0 text-xs"
                  onClick={() => setStep(2)}
                >
                  Edit
                </Button>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Tags</h4>
                <div className="mt-1 flex flex-wrap gap-1">
                  {tags && tags.length > 0 ?  (
                    tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">No tags</span>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Files</h4>
                <div className="mt-1 space-y-1">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <FileIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{file. name}</span>
                      <span className="text-muted-foreground">
                        ({bytesToSize(file.size)})
                      </span>
                    </div>
                  ))}
                </div>
                <Button
                  variant="link"
                  className="h-auto p-0 text-xs"
                  onClick={() => setStep(1)}
                >
                  Change files
                </Button>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {price > 0 && (
                <div className="rounded-lg bg-muted/50 p-4">
                  <h4 className="text-sm font-medium">Earnings Breakdown</h4>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sale price</span>
                      <span>{formatPrice(price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Platform fee ({PLATFORM.COMMISSION_PERCENT}%)
                      </span>
                      <span className="text-destructive">-{formatPrice(platformFee)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-medium">
                      <span>You earn</span>
                      <span className="text-green-600">{formatPrice(earnings)}</span>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Ownership Proof
                </h4>
                <p className="mt-1 text-sm">
                  {proofType === 'TEXT' && 'Description provided'}
                  {proofType === 'LINK' && 'Portfolio link provided'}
                  {proofType === 'FILE' && 'Source files described'}
                </p>
                <Button
                  variant="link"
                  className="h-auto p-0 text-xs"
                  onClick={() => setStep(4)}
                >
                  Edit proof
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Terms Reminder */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
        <p className="text-sm text-amber-800 dark:text-amber-200">
          <strong>Before you submit:</strong> Make sure you have the right to sell this
          asset and that it doesn't contain any copyrighted material. Assets that violate
          our terms will be rejected.
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={prevStep}>
          Back
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting... 
            </>
          ) : (
            'Submit for Review'
          )}
        </Button>
      </div>
    </div>
  );
}