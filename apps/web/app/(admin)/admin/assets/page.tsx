'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { Eye, Package, Clock } from 'lucide-react';

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
import { adminApi } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';

export default function AdminAssetsPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-pending-assets', page],
    queryFn:  async () => {
      const response = await adminApi.getPendingAssets({ page, limit: 20 });
      return response.data;
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Asset Review</h1>
        <p className="mt-1 text-muted-foreground">
          Review and approve assets submitted by creators
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : !data?. items || data.items.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No pending assets"
          description="All assets have been reviewed.  Great work!"
        />
      ) : (
        <>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[400px]">Asset</TableHead>
                  <TableHead>Creator</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data. items.map((asset: any) => (
                  <TableRow key={asset.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative h-16 w-16 overflow-hidden rounded bg-muted">
                          {asset.thumbnailUrl ? (
                            <Image
                              src={asset. thumbnailUrl}
                              alt={asset.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <Package className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium line-clamp-1">
                            {asset.title}
                          </p>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {asset.description}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{asset.owner. name || asset.owner.username}</p>
                        <p className="text-sm text-muted-foreground">
                          @{asset.owner.username}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{asset.assetType}</Badge>
                    </TableCell>
                    <TableCell>{formatPrice(asset.price)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(asset.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Button size="sm" asChild>
                        <Link href={`/admin/assets/${asset.id}`}>
                          <Eye className="mr-1 h-3 w-3" />
                          Review
                        </Link>
                      </Button>
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