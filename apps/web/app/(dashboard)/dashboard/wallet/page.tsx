'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DollarSign,
  TrendingUp,
  Download,
  ArrowUpRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { walletApi } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function WalletPage() {
  const queryClient = useQueryClient();
  const [payoutAmount, setPayoutAmount] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data:  balance, isLoading: balanceLoading } = useQuery({
    queryKey: ['wallet-balance'],
    queryFn:  async () => {
      const response = await walletApi.getBalance();
      return response.data;
    },
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['wallet-stats'],
    queryFn: async () => {
      const response = await walletApi.getStats();
      return response.data;
    },
  });

  const { data: earnings } = useQuery({
    queryKey: ['wallet-earnings'],
    queryFn: async () => {
      const response = await walletApi.getEarnings({ page: 1, limit: 10 });
      return response. data;
    },
  });

  const { data: payouts } = useQuery({
    queryKey: ['wallet-payouts'],
    queryFn: async () => {
      const response = await walletApi.getPayoutHistory({ page: 1, limit: 10 });
      return response.data;
    },
  });

  const payoutMutation = useMutation({
    mutationFn: async (amount: number) => {
      await walletApi.requestPayout(amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-stats'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-payouts'] });
      toast.success('Payout requested successfully');
      setDialogOpen(false);
      setPayoutAmount('');
    },
    onError: (error:  any) => {
      toast.error(error.message || 'Failed to request payout');
    },
  });

  const handlePayoutRequest = () => {
    const amount = parseFloat(payoutAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    payoutMutation.mutate(amount);
  };

  const statusColors:  Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    PAID: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Wallet</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your earnings and payouts
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Current Balance
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {balanceLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">
                {formatPrice(balance?. balance || 0)}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Available for payout
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Earnings
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">
                {formatPrice(stats?.totalEarnings || 0)}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              From {stats?.totalSales || 0} sales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Payouts
            </CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">
                {formatPrice(stats?.pendingPayouts || 0)}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Being processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Quick Action</CardTitle>
          </CardHeader>
          <CardContent>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  className="w-full"
                  disabled={! balance?. paymentVerified || (balance?.balance || 0) < 50}
                >
                  <ArrowUpRight className="mr-2 h-4 w-4" />
                  Request Payout
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Request Payout</DialogTitle>
                  <DialogDescription>
                    Enter the amount you want to withdraw from your wallet. 
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (USD)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="50. 00"
                      step="0.01"
                      min="50"
                      max={balance?.balance || 0}
                      value={payoutAmount}
                      onChange={(e) => setPayoutAmount(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Minimum: $50.00 • Available: {formatPrice(balance?.balance || 0)}
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handlePayoutRequest}
                    disabled={payoutMutation.isPending}
                  >
                    {payoutMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Requesting...
                      </>
                    ) : (
                      'Request Payout'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      {/* Payment Verification Alert */}
      {! balance?.paymentVerified && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please verify your payment information before requesting a payout. 
            <Button variant="link" className="ml-2 h-auto p-0">
              Verify Now
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Earnings & Payouts Tabs */}
      <Tabs defaultValue="earnings">
        <TabsList>
          <TabsTrigger value="earnings">Recent Earnings</TabsTrigger>
          <TabsTrigger value="payouts">Payout History</TabsTrigger>
        </TabsList>

        <TabsContent value="earnings" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Earnings</CardTitle>
              <CardDescription>
                Your latest sales and earnings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {earnings?.items. map((earning: any) => (
                  <div
                    key={earning.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">{earning.asset. title}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(earning.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        +{formatPrice(earning.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Fee: {formatPrice(earning.platformFee)}
                      </p>
                    </div>
                  </div>
                ))}
                {(! earnings || earnings.items.length === 0) && (
                  <p className="text-center text-muted-foreground">
                    No earnings yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Payout History</CardTitle>
              <CardDescription>
                Track your payout requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payouts?. items.map((payout: any) => (
                  <div
                    key={payout. id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">
                        {formatPrice(payout.amount)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(payout. createdAt)}
                      </p>
                    </div>
                    <Badge
                      className={statusColors[payout.status] || ''}
                      variant="secondary"
                    >
                      {payout.status}
                    </Badge>
                  </div>
                ))}
                {(!payouts || payouts.items.length === 0) && (
                  <p className="text-center text-muted-foreground">
                    No payouts yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}