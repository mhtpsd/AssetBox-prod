import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import {
  Package,
  DollarSign,
  Download,
  TrendingUp,
  Clock,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';

async function getUserStats(userId: string) {
  // In real app, fetch from API
  // For now, return mock data
  return {
    totalAssets: 12,
    pendingAssets: 2,
    approvedAssets: 10,
    totalSales: 47,
    totalEarnings: 1234.56,
    pendingPayouts: 0,
    totalDownloads: 156,
    walletBalance: 567.89,
  };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  const stats = await getUserStats(session.user.id);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-gradient">
            Welcome back, {session.user.name?.split(' ')[0] || 'Creator'}!
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Here's an overview of your account.
          </p>
        </div>
        <Button asChild size="lg" className="h-12 text-base px-6 hover-lift shadow-lg">
          <Link href="/dashboard/uploads/new">Upload New Asset</Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-lift transition-all border-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Wallet Balance</CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {formatPrice(stats.walletBalance)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Available for payout
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift transition-all border-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Total Earnings</CardTitle>
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatPrice(stats.totalEarnings)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              From {stats.totalSales} sales
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift transition-all border-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Total Downloads</CardTitle>
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Download className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalDownloads}</div>
            <p className="text-sm text-muted-foreground mt-1">
              Across all assets
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift transition-all border-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Assets</CardTitle>
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Package className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalAssets}</div>
            <p className="text-sm text-muted-foreground mt-1">
              {stats.approvedAssets} live, {stats.pendingAssets} pending
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-2 shadow-lg animate-slide-up">
          <CardHeader>
            <CardTitle className="text-2xl">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button asChild variant="outline" size="lg" className="justify-start h-14 text-base hover-lift">
              <Link href="/dashboard/uploads/new">
                <Package className="mr-3 h-5 w-5" />
                Upload New Asset
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="justify-start h-14 text-base hover-lift">
              <Link href="/dashboard/wallet">
                <DollarSign className="mr-3 h-5 w-5" />
                Request Payout
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="justify-start h-14 text-base hover-lift">
              <Link href="/dashboard/settings">
                <CheckCircle className="mr-3 h-5 w-5" />
                Complete Profile
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-lg animate-slide-up" style={{ animationDelay: '100ms' }}>
          <CardHeader>
            <CardTitle className="text-2xl">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.pendingAssets > 0 ? (
              <div className="flex items-center gap-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
                  <Clock className="h-7 w-7 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="font-semibold text-lg">
                    {stats.pendingAssets} asset{stats.pendingAssets > 1 ? 's' : ''} pending review
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Usually reviewed within 24-48 hours
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4 p-4 rounded-xl bg-green-50 dark:bg-green-950/30">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                  <CheckCircle className="h-7 w-7 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-semibold text-lg">All caught up!</p>
                  <p className="text-sm text-muted-foreground">
                    No assets pending review
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}