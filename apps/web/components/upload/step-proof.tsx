'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FileText, Link2, Upload, Shield } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useUploadStore } from '@/stores/upload-store';

const proofSchema = z.object({
  proofType: z.enum(['TEXT', 'LINK', 'FILE']),
  proofData: z.string().min(10, 'Please provide proof of ownership'),
});

type ProofFormData = z.infer<typeof proofSchema>;

export function StepProof() {
  const { proofType, proofData, setProof, nextStep, prevStep } = useUploadStore();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProofFormData>({
    resolver: zodResolver(proofSchema),
    defaultValues:  {
      proofType: proofType || 'TEXT',
      proofData: proofData || '',
    },
  });

  const selectedProofType = watch('proofType');

  const onSubmit = (data: ProofFormData) => {
    setProof({
      type: data.proofType,
      data: data.proofData,
    });
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Verify Ownership</h2>
        <p className="mt-1 text-muted-foreground">
          Provide proof that you own or have rights to sell this asset.
        </p>
      </div>

      {/* Why We Ask */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          We verify ownership to protect both creators and buyers. This helps prevent
          copyright infringement and ensures all assets on our platform are legitimate.
        </AlertDescription>
      </Alert>

      {/* Proof Type Selection */}
      <div className="space-y-4">
        <Label>How would you like to prove ownership?</Label>
        <RadioGroup
          value={selectedProofType}
          onValueChange={(value:  any) => {
            setValue('proofType', value);
            setValue('proofData', '');
          }}
          className="grid gap-4 md:grid-cols-3"
        >
          <Label
            htmlFor="proof-text"
            className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border p-4 text-center [&:has(:checked)]:border-primary [&:has(: checked)]:bg-primary/5"
          >
            <RadioGroupItem value="TEXT" id="proof-text" className="sr-only" />
            <FileText className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="font-medium">Description</p>
              <p className="text-xs text-muted-foreground">
                Describe how you created this
              </p>
            </div>
          </Label>

          <Label
            htmlFor="proof-link"
            className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border p-4 text-center [&:has(:checked)]:border-primary [&: has(:checked)]:bg-primary/5"
          >
            <RadioGroupItem value="LINK" id="proof-link" className="sr-only" />
            <Link2 className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="font-medium">Portfolio Link</p>
              <p className="text-xs text-muted-foreground">
                Link to your portfolio or social
              </p>
            </div>
          </Label>

          <Label
            htmlFor="proof-file"
            className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border p-4 text-center [&:has(:checked)]:border-primary [&: has(:checked)]:bg-primary/5"
          >
            <RadioGroupItem value="FILE" id="proof-file" className="sr-only" />
            <Upload className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="font-medium">Source Files</p>
              <p className="text-xs text-muted-foreground">
                Describe source/project files
              </p>
            </div>
          </Label>
        </RadioGroup>
      </div>

      {/* Proof Data Input */}
      <div className="space-y-2">
        {selectedProofType === 'TEXT' && (
          <>
            <Label htmlFor="proofData">
              Describe how you created this asset
            </Label>
            <Textarea
              id="proofData"
              rows={5}
              placeholder="Explain the creative process, tools used, when and where it was created, etc.  The more detail, the better."
              {... register('proofData')}
            />
          </>
        )}

        {selectedProofType === 'LINK' && (
          <>
            <Label htmlFor="proofData">
              Link to your portfolio or social media
            </Label>
            <Input
              id="proofData"
              type="url"
              placeholder="https://yourportfolio.com or https://instagram.com/yourusername"
              {... register('proofData')}
            />
            <p className="text-xs text-muted-foreground">
              Provide a link where we can verify this work is yours (portfolio, Behance, Instagram, etc.)
            </p>
          </>
        )}

        {selectedProofType === 'FILE' && (
          <>
            <Label htmlFor="proofData">
              Describe your source/project files
            </Label>
            <Textarea
              id="proofData"
              rows={5}
              placeholder="Describe the original project files you have (e.g., PSD, AI, RAW files, project folders). Our team may request these during review."
              {...register('proofData')}
            />
          </>
        )}

        {errors.proofData && (
          <p className="text-sm text-destructive">{errors.proofData.message}</p>
        )}
      </div>

      {/* Ownership Declaration */}
      <div className="rounded-lg border bg-muted/50 p-4">
        <p className="text-sm">
          By submitting this asset, I declare that:
        </p>
        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
          <li>• I am the original creator or have legal rights to sell this work</li>
          <li>• This asset does not infringe on any copyrights or trademarks</li>
          <li>• I have obtained necessary releases for any recognizable people or property</li>
          <li>• I agree to the AssetBox Terms of Service and Creator Agreement</li>
        </ul>
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={prevStep}>
          Back
        </Button>
        <Button type="submit">Continue to Review</Button>
      </div>
    </form>
  );
}