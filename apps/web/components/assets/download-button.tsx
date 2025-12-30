'use client';

import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDownloadAsset } from '@/hooks/use-commerce';

interface DownloadButtonProps {
  assetId: string;
}

export function DownloadButton({ assetId }: DownloadButtonProps) {
  const downloadMutation = useDownloadAsset();

  return (
    <Button
      className="w-full"
      size="lg"
      onClick={() => downloadMutation.mutate(assetId)}
      disabled={downloadMutation.isPending}
    >
      {downloadMutation.isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating link...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Download
        </>
      )}
    </Button>
  );
}