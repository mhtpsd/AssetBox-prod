'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useUploadStore } from '@/stores/upload-store';

import { StepFiles } from '@/components/upload/step-files';
import { StepDetails } from '@/components/upload/step-details';
import { StepPricing } from '@/components/upload/step-pricing';
import { StepProof } from '@/components/upload/step-proof';
import { StepReview } from '@/components/upload/step-review';

const steps = [
  { id: 1, name: 'Files', description: 'Upload your files' },
  { id: 2, name: 'Details', description: 'Add information' },
  { id: 3, name: 'Pricing', description: 'Set your price' },
  { id: 4, name: 'Proof', description: 'Verify ownership' },
  { id: 5, name: 'Review', description: 'Review & submit' },
];

export default function NewUploadPage() {
  const router = useRouter();
  const { step, reset } = useUploadStore();

  const handleComplete = () => {
    reset();
    router.push('/dashboard/uploads');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Upload New Asset</h1>
        <p className="mt-1 text-muted-foreground">
          Share your work with the world and start earning. 
        </p>
      </div>

      {/* Progress Steps */}
      <nav aria-label="Progress">
        <ol className="flex items-center">
          {steps. map((s, index) => (
            <li
              key={s. id}
              className={cn(
                'relative',
                index !== steps.length - 1 ?  'flex-1 pr-8' : ''
              )}
            >
              <div className="flex items-center">
                <div
                  className={cn(
                    'relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors',
                    step > s.id
                      ? 'border-primary bg-primary text-primary-foreground'
                      : step === s.id
                        ? 'border-primary bg-background text-primary'
                        : 'border-muted bg-background text-muted-foreground'
                  )}
                >
                  {step > s.id ?  (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-semibold">{s.id}</span>
                  )}
                </div>

                {index !== steps.length - 1 && (
                  <div
                    className={cn(
                      'absolute left-10 top-5 h-0.5 w-[calc(100%-2. 5rem)]',
                      step > s.id ?  'bg-primary' : 'bg-muted'
                    )}
                  />
                )}
              </div>

              <div className="mt-2 hidden md:block">
                <span
                  className={cn(
                    'text-sm font-medium',
                    step >= s.id ?  'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {s.name}
                </span>
                <p className="text-xs text-muted-foreground">{s.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </nav>

      {/* Step Content */}
      <div className="rounded-lg border bg-card p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {step === 1 && <StepFiles />}
            {step === 2 && <StepDetails />}
            {step === 3 && <StepPricing />}
            {step === 4 && <StepProof />}
            {step === 5 && <StepReview onComplete={handleComplete} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}