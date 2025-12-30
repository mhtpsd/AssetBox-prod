'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DollarSign, Check, X, Loader2, AlertCircle } from 'lucide-react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { adminApi } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';

export default function AdminPayoutsPage() {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-pending-payouts', page],
    queryFn:  async () => {
      const response = await adminApi.getPendingPayouts({ page, limit: 20 });
      return response.data;
    },
  });

  const processMutation = useMutation({
    mutationFn: async (payoutId: string) => {
      await adminApi.processPayout(payoutId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-payouts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('Payout processed successfully');
    },
    onError: () => {
      toast.error('Failed to process payout');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ payoutId, reason }: { payoutId: string; reason:  string }) => {
      await adminApi.rejectPayout(payoutId, reason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-payouts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('Payout rejected');
      setRejectDialogOpen(false);
      setSelectedPayout(null);
      setRejectReason('');
    },
    onError: () => {
      toast.error('Failed to reject payout');
    },
  });

  const handleRejectClick = (payoutId: string) => {
    setSelectedPayout(payoutId);
    setRejectDialogOpen(true);
  };

  const handleReject = () => {
    if (! selectedPayout) return;
    if (rejectReason.trim().length < 10) {
      toast.error('Please provide a detailed reason (at least 10 characters)');
      return;
    }
    rejectMutation.mutate({ payoutId: selectedPayout, reason: rejectReason });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payout Requests</h1>
        <p className="mt-1 text-muted-foreground">
          Review and process creator payout requests
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array. from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : !data?.items || data.items.length === 0 ? (
        <EmptyState
          icon={DollarSign}
          title="No pending payouts"
          description="All payout requests have been processed."
        />
      ) : (
        <>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Creator</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead className="w-[200px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((payout:  any) => (
                  <TableRow key={payout.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {payout.user.name || payout.user. username}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          @{payout.user.username}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {payout.user.email}
                    </TableCell>
                    <TableCell>
                      <span className="text-lg font-bold">
                        {formatPrice(payout.amount)}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(payout.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => processMutation.mutate(payout.id)}
                          disabled={processMutation.isPending}
                        >
                          {processMutation.isPending ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <>
                              <Check className="mr-1 h-3 w-3" />
                              Approve
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRejectClick(payout.id)}
                          disabled={rejectMutation.isPending}
                        >
                          <X className="mr-1 h-3 w-3" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

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

      {/* Reject Dialog */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Payout Request</AlertDialogTitle>
            <AlertDialogDescription>
              Provide a reason for rejecting this payout.  The amount will be
              returned to the creator's wallet.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Explain why this payout request is being rejected..."
              rows={5}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Minimum 10 characters required
            </p>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setRejectReason('');
                setSelectedPayout(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              className="bg-destructive hover: bg-destructive/90"
              disabled={rejectMutation. isPending}
            >
              {rejectMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejecting... 
                </>
              ) : (
                'Reject Payout'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}