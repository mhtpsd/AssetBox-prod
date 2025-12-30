'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DollarSign, Info } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useUploadStore } from '@/stores/upload-store';
import { LICENSE_TYPES, PLATFORM } from '@assetbox/config';
import { formatPrice } from '@/lib/utils';

const pricingSchema = z.object({
  price: z.number().min(0).max(10000),
  licenseType: z.enum(['STANDARD', 'COMMERCIAL', 'EXTENDED']),
});

type PricingFormData = z.infer<typeof pricingSchema>;

export function StepPricing() {
  const { price, licenseType, setPricing, nextStep, prevStep } = useUploadStore();
  const [isFree, setIsFree] = useState(price === 0);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PricingFormData>({
    resolver: zodResolver(pricingSchema),
    defaultValues:  {
      price:  price || 0,
      licenseType:  licenseType || 'STANDARD',
    },
  });

  const currentPrice = watch('price');
  const platformFee = currentPrice * (PLATFORM.COMMISSION_PERCENT / 100);
  const yourEarnings = currentPrice - platformFee;

  const onSubmit = (data: PricingFormData) => {
    setPricing({
      price: isFree ? 0 : data.price,
      licenseType: data.licenseType,
    });
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Set Your Price</h2>
        <p className="mt-1 text-muted-foreground">
          Choose how much you want to charge for your asset. 
        </p>
      </div>

      {/* Free or Paid */}
      <div className="space-y-4">
        <Label>Pricing Model</Label>
        <RadioGroup
          value={isFree ? 'free' : 'paid'}
          onValueChange={(value) => {
            setIsFree(value === 'free');
            if (value === 'free') {
              setValue('price', 0);
            }
          }}
          className="grid gap-4 md: grid-cols-2"
        >
          <Label
            htmlFor="free"
            className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 [&:has(: checked)]:border-primary [&:has(:checked)]:bg-primary/5"
          >
            <RadioGroupItem value="free" id="free" className="mt-1" />
            <div>
              <p className="font-medium">Free</p>
              <p className="text-sm text-muted-foreground">
                Offer your asset for free to build your audience
              </p>
            </div>
          </Label>
          <Label
            htmlFor="paid"
            className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 [&:has(:checked)]:border-primary [&: has(:checked)]:bg-primary/5"
          >
            <RadioGroupItem value="paid" id="paid" className="mt-1" />
            <div>
              <p className="font-medium">Paid</p>
              <p className="text-sm text-muted-foreground">
                Set a price and earn money from sales
              </p>
            </div>
          </Label>
        </RadioGroup>
      </div>

      {/* Price Input */}
      {! isFree && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="price">Price (USD)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                max="10000"
                className="pl-9"
                {...register('price', { valueAsNumber:  true })}
              />
            </div>
            {errors.price && (
              <p className="text-sm text-destructive">{errors.price.message}</p>
            )}
          </div>

          {/* Earnings Breakdown */}
          {currentPrice > 0 && (
            <div className="rounded-lg bg-muted/50 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Your price</span>
                <span>{formatPrice(currentPrice)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="flex items-center gap-1 text-muted-foreground">
                  Platform fee ({PLATFORM.COMMISSION_PERCENT}%)
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-3 w-3" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          This fee covers payment processing, hosting, and platform maintenance.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </span>
                <span className="text-destructive">-{formatPrice(platformFee)}</span>
              </div>
              <div className="mt-2 border-t pt-2">
                <div className="flex items-center justify-between font-medium">
                  <span>Your earnings</span>
                  <span className="text-green-600">{formatPrice(yourEarnings)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* License Type */}
      <div className="space-y-4">
        <Label>License Type</Label>
        <RadioGroup
          value={watch('licenseType')}
          onValueChange={(value:  any) => setValue('licenseType', value)}
          className="space-y-3"
        >
          {LICENSE_TYPES. map((license) => (
            <Label
              key={license.value}
              htmlFor={license.value}
              className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 [&: has(:checked)]:border-primary [&:has(:checked)]:bg-primary/5"
            >
              <RadioGroupItem value={license. value} id={license.value} className="mt-1" />
              <div>
                <p className="font-medium">{license.label}</p>
                <p className="text-sm text-muted-foreground">{license.description}</p>
              </div>
            </Label>
          ))}
        </RadioGroup>
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