'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { Package, Eye } from 'lucide-react';

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
import { ordersApi } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';

const statusColors:  Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
};

export default function OrdersPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['orders', page],
    queryFn: async () => {
      const response = await ordersApi.list({ page, limit: 20 });
      return response.data;
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Order History</h1>
        <p className="mt-1 text-muted-foreground">
          View all your past orders and transactions
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : !data?.items || data.items.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No orders yet"
          description="Your order history will appear here once you make a purchase."
          action={{
            label: 'Browse Assets',
            onClick: () => (window.location.href = '/search'),
          }}
        />
      ) : (
        <>
          <div className="space-y-4">
            {data.items.map((order: any) => (
              <div
                key={order.id}
                className="rounded-lg border bg-card p-6"
              >
                {/* Order Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">
                        Order #{order.id. slice(0, 8)}
                      </h3>
                      <Badge
                        className={statusColors[order.paymentStatus] || ''}
                        variant="secondary"
                      >
                        {order.paymentStatus}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">
                      {formatPrice(order.totalAmount)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order. items.length} {order.items.length === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mt-4 space-y-2">
                  {order.items.map((item: any) => (
                    <div
                      key={item. id}
                      className="flex items-center gap-3 rounded-lg bg-muted/50 p-3"
                    >
                      <div className="relative h-12 w-12 overflow-hidden rounded bg-muted">
                        {item. asset.thumbnailUrl ? (
                          <Image
                            src={item.asset.thumbnailUrl}
                            alt={item. asset.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                            No img
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.asset.title}</p>
                        <Badge variant="outline" className="mt-1">
                          {item. asset.assetType}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatPrice(item.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                {order.paymentStatus === 'PAID' && (
                  <div className="mt-4 flex justify-end gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/orders/${order.id}`}>
                        <Eye className="mr-1 h-3 w-3" />
                        View Details
                      </Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link href="/dashboard/purchases">
                        Download Assets
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            ))}
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