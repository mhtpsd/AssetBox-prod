'use client';

import { useQuery } from '@tanstack/react-query';
import { 
  Users, 
  Package, 
  Clock, 
  DollarSign,
  TrendingUp,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';
import Link from 'next/link';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { adminApi, supportApi } from '@/lib/api';
import { formatPrice, formatNumber } from '@/lib/utils';

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const response = await adminApi.getStats();
      return response.data;
    },
  });

  const { data: supportStats } = useQuery({
    queryKey: ['admin-support-stats'],
    queryFn: async () => {
      const response = await supportApi.getStats();
      return response.data;
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Platform overview and moderation tools
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <Button asChild variant={stats?.pendingAssets ? 'default' : 'outline'}>
          <Link href="/admin/assets">
            <Package className="mr-2 h-4 w-4" />
            Review Assets
            {stats?.pendingAssets > 0 && (
              <span className="ml-2 rounded-full bg-white px-2 py-0.5 text-xs font-bold text-primary">
                {stats. pendingAssets}
              </span>
            )}
          </Link>
        </Button>
        <Button asChild variant={stats?.pendingPayouts ? 'default' : 'outline'}>
          <Link href="/admin/payouts">
            <DollarSign className="mr-2 h-4 w-4" />
            Process Payouts
            {stats?. pendingPayouts > 0 && (
              <span className="ml-2 rounded-full bg-white px-2 py-0.5 text-xs font-bold text-primary">
                {stats.pendingPayouts}
              </span>
            )}
          </Link>
        </Button>
        <Button asChild variant={supportStats?. openTickets ? 'default' : 'outline'}>
          <Link href="/admin/support">
            <MessageSquare className="mr-2 h-4 w-4" />
            Support Tickets
            {supportStats?.openTickets > 0 && (
              <span className="ml-2 rounded-full bg-white px-2 py-0.5 text-xs font-bold text-primary">
                {supportStats.openTickets}
              </span>
            )}
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {formatNumber(stats?.totalUsers || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Registered creators
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {formatNumber(stats?.totalAssets || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Approved & live
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Review
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {formatNumber(stats?.pendingAssets || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Awaiting approval
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Revenue
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {formatPrice(stats?.totalRevenue || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Platform sales
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {(stats?.pendingAssets > 0 || stats?.pendingPayouts > 0) && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800 dark: text-amber-200">
              <AlertCircle className="h-5 w-5" />
              Action Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats. pendingAssets > 0 && (
              <p className="text-sm text-amber-800 dark:text-amber-200">
                • {stats.pendingAssets} asset{stats.pendingAssets > 1 ? 's' : ''}{' '}
                waiting for review
              </p>
            )}
            {stats.pendingPayouts > 0 && (
              <p className="text-sm text-amber-800 dark: text-amber-200">
                • {stats.pendingPayouts} payout request
                {stats.pendingPayouts > 1 ? 's' :  ''} to process
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Health</CardTitle>
          <CardDescription>
            Everything looks good! The platform is running smoothly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <Package className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-medium">Content Quality</p>
                <p className="text-sm text-muted-foreground">
                  All systems operational
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium">Payment Processing</p>
                <p className="text-sm text-muted-foreground">
                  All payments processing normally
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="font-medium">User Activity</p>
                <p className="text-sm text-muted-foreground">
                  Community is engaged
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}