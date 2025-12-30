'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { Download, ExternalLink, Package } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { downloadsApi } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';

export default function PurchasesPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['my-purchases', page],
    queryFn:  async () => {
      const response = await downloadsApi.myAssets({ page, limit: 20 });
      return response.data;
    },
  });

  const downloadMutation = useMutation({
    mutationFn: async (assetId: string) => {
      const { data } = await downloadsApi. getUrl(assetId);
      return data;
    },
    onSuccess: (data) => {
      // Trigger download
      const link = document.createElement('a');
      link.href = data.url;
      link.download = data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Download started');
    },
    onError: () => {
      toast.error('Failed to generate download link');
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Purchases</h1>
        <p className="mt-1 text-muted-foreground">
          Assets you've purchased and can download
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : !data?.items || data.items.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No purchases yet"
          description="Purchase assets from the marketplace to see them here."
          action={{
            label: 'Browse Assets',
            onClick: () => (window.location.href = '/search'),
          }}
        />
      ) : (
        <>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Asset</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Downloads</TableHead>
                  <TableHead>Purchased</TableHead>
                  <TableHead className="w-[120px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 overflow-hidden rounded bg-muted">
                          {item.thumbnailUrl ? (
                            <Image
                              src={item. thumbnailUrl}
                              alt={item.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                              No img
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium line-clamp-1">{item.title}</p>
                          <p className="text-sm text-muted-foreground">
                            by {item. owner.username}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{item.assetType}</Badge>
                    </TableCell>
                    <TableCell>
                      {item.price === 0 ? (
                        <span className="text-muted-foreground">Free</span>
                      ) : (
                        formatPrice(item.price)
                      )}
                    </TableCell>
                    <TableCell>{item.downloadedCount} times</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(item.purchasedAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => downloadMutation.mutate(item.id)}
                          disabled={downloadMutation.isPending}
                        >
                          <Download className="mr-1 h-3 w-3" />
                          Download
                        </Button>
                        <Button size="sm" variant="ghost" asChild>
                          <Link href={`/assets/${item.id}`}>
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {page} of {data.totalPages} ({data.total} total)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                  disabled={page === data.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}