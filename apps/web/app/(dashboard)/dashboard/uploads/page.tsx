'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import {
  Plus,
  Search,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { assetsApi } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';

const statusConfig:  Record<string, { label: string; icon: any; variant: any }> = {
  DRAFT: { label: 'Draft', icon:  AlertCircle, variant:  'secondary' },
  PENDING: { label: 'Pending Review', icon: Clock, variant: 'warning' },
  APPROVED: { label:  'Live', icon: CheckCircle, variant: 'success' },
  REJECTED: { label: 'Rejected', icon: XCircle, variant:  'destructive' },
  REMOVED: { label: 'Removed', icon: Trash2, variant: 'destructive' },
};

export default function MyUploadsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['my-uploads', statusFilter, page],
    queryFn: async () => {
      const params:  any = { page, limit: 20 };
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      const response = await assetsApi.getMyUploads(params);
      return response.data;
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Uploads</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your uploaded assets
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/uploads/new">
            <Plus className="mr-2 h-4 w-4" />
            Upload New
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search uploads..." className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="PENDING">Pending Review</SelectItem>
            <SelectItem value="APPROVED">Live</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : !data?. items || data. items.length === 0 ? (
        <EmptyState
          icon={Plus}
          title="No uploads yet"
          description="Upload your first asset to start selling on AssetBox."
          action={{
            label: 'Upload Asset',
            onClick: () => (window.location.href = '/dashboard/uploads/new'),
          }}
        />
      ) : (
        <>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Asset</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Sales</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((asset:  any) => {
                  const status = statusConfig[asset.status];
                  const StatusIcon = status?. icon || AlertCircle;

                  return (
                    <TableRow key={asset.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 overflow-hidden rounded bg-muted">
                            {asset.thumbnailUrl ?  (
                              <Image
                                src={asset.thumbnailUrl}
                                alt={asset.title}
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
                            <p className="font-medium line-clamp-1">{asset.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {asset.assetType} • {asset.category}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            asset.status === 'APPROVED'
                              ? 'default'
                              :  asset.status === 'PENDING'
                                ? 'secondary'
                                : asset.status === 'REJECTED'
                                  ? 'destructive'
                                  : 'outline'
                          }
                          className="gap-1"
                        >
                          <StatusIcon className="h-3 w-3" />
                          {status?.label || asset.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {asset.price === 0 ? (
                          <span className="text-muted-foreground">Free</span>
                        ) : (
                          formatPrice(asset.price)
                        )}
                      </TableCell>
                      <TableCell>{asset.viewCount || 0}</TableCell>
                      <TableCell>{asset.totalSales || 0}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(asset.createdAt)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/assets/${asset.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </Link>
                            </DropdownMenuItem>
                            {['DRAFT', 'REJECTED'].includes(asset. status) && (
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/uploads/${asset. id}/edit`}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                            )}
                            {asset.status === 'APPROVED' && (
                              <DropdownMenuItem asChild>
                                <a
                                  href={`/assets/${asset.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="mr-2 h-4 w-4" />
                                  View Live
                                </a>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
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
                  disabled={page === data. totalPages}
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