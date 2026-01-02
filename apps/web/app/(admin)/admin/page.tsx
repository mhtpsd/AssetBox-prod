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
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-4xl md:text-5xl font-bold text-gradient">Admin Dashboard</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Platform overview and moderation tools
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4 animate-slide-up">
        <Button asChild size="lg" variant={stats?.pendingAssets ? 'default' : 'outline'} className="h-12 hover-lift">
          <Link href="/admin/assets">
            <Package className="mr-2 h-5 w-5" />
            Review Assets
            {stats?.pendingAssets > 0 && (
              <span className="ml-2 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-primary">
                {stats.pendingAssets}
              </span>
            )}
          </Link>
        </Button>
        <Button asChild size="lg" variant={stats?.pendingPayouts ? 'default' : 'outline'} className="h-12 hover-lift">
          <Link href="/admin/payouts">
            <DollarSign className="mr-2 h-5 w-5" />
            Process Payouts
            {stats?.pendingPayouts > 0 && (
              <span className="ml-2 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-primary">
                {stats.pendingPayouts}
              </span>
            )}
          </Link>
        </Button>
        <Button asChild size="lg" variant={supportStats?.openTickets ? 'default' : 'outline'} className="h-12 hover-lift">
          <Link href="/admin/support">
            <MessageSquare className="mr-2 h-5 w-5" />
            Support Tickets
            {supportStats?.openTickets > 0 && (
              <span className="ml-2 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-primary">
                {supportStats.openTickets}
              </span>
            )}
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-lift transition-all border-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Total Users</CardTitle>
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-28" />
            ) : (
              <>
                <div className="text-3xl font-bold">
                  {formatNumber(stats?.totalUsers || 0)}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Registered creators
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="hover-lift transition-all border-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Total Assets</CardTitle>
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Package className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-28" />
            ) : (
              <>
                <div className="text-3xl font-bold">
                  {formatNumber(stats?.totalAssets || 0)}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Approved & live
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="hover-lift transition-all border-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              Pending Review
            </CardTitle>
            <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-28" />
            ) : (
              <>
                <div className="text-3xl font-bold">
                  {formatNumber(stats?.pendingAssets || 0)}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Awaiting approval
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="hover-lift transition-all border-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              Total Revenue
            </CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-28" />
            ) : (
              <>
                <div className="text-3xl font-bold">
                  {formatPrice(stats?.totalRevenue || 0)}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Platform sales
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {(stats?.pendingAssets > 0 || stats?.pendingPayouts > 0) && (
        <Card className="border-2 border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 shadow-lg animate-scale-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200 text-xl">
              <div className="p-2 bg-amber-200 dark:bg-amber-900 rounded-lg">
                <AlertCircle className="h-6 w-6" />
              </div>
              Action Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.pendingAssets > 0 && (
              <p className="text-base text-amber-800 dark:text-amber-200 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-600 animate-pulse" />
                {stats.pendingAssets} asset{stats.pendingAssets > 1 ? 's' : ''}{' '}
                waiting for review
              </p>
            )}
            {stats.pendingPayouts > 0 && (
              <p className="text-base text-amber-800 dark:text-amber-200 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-600 animate-pulse" />
                {stats.pendingPayouts} payout request
                {stats.pendingPayouts > 1 ? 's' : ''} to process
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card className="border-2 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Platform Health</CardTitle>
          <CardDescription className="text-base">
            Everything looks good! The platform is running smoothly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-green-50 dark:bg-green-950/30 hover-lift">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <Package className="h-7 w-7 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-semibold text-lg">Content Quality</p>
                <p className="text-sm text-muted-foreground">
                  All systems operational
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 hover-lift">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                <DollarSign className="h-7 w-7 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-semibold text-lg">Payment Processing</p>
                <p className="text-sm text-muted-foreground">
                  All payments processing normally
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 hover-lift">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                <Users className="h-7 w-7 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="font-semibold text-lg">User Activity</p>
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