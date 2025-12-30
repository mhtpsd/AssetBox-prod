import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Image from 'next/image';
import { Calendar, Package } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getInitials, formatDate } from '@/lib/utils';
import { AssetGridSkeleton } from '@/components/shared/loading-skeleton';
import { Suspense } from 'react';

interface Props {
  params: { username: string };
}

async function getUser(username: string) {
  try {
    const res = await fetch(
      `${process.env. NEXT_PUBLIC_API_URL}/api/users/${username}`,
      { cache: 'no-store' }
    );

    if (!res. ok) return null;
    
    const data = await res.json();
    return data. data;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const user = await getUser(params.username);

  if (!user) {
    return {
      title: 'User Not Found',
    };
  }

  return {
    title: `${user.name || user.username} - Creator Profile`,
    description: user.bio || `Check out ${user.name || user.username}'s assets on AssetBox`,
  };
}

export default async function UserProfilePage({ params }:  Props) {
  const user = await getUser(params.username);

  if (!user) {
    notFound();
  }

  return (
    <div className="container py-8">
      {/* Profile Header */}
      <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
        <Avatar className="h-32 w-32">
          <AvatarImage src={user.image || undefined} />
          <AvatarFallback className="text-4xl">
            {getInitials(user.name || user.username)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-bold">{user.name || user.username}</h1>
          <p className="mt-1 text-muted-foreground">@{user.username}</p>

          {user.bio && (
            <p className="mt-4 max-w-2xl text-muted-foreground">{user.bio}</p>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground md:justify-start">
            <div className="flex items-center gap-1">
              <Package className="h-4 w-4" />
              <span>{user.totalAssets} assets</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Joined {formatDate(user.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Assets Tabs */}
      <div className="mt-12">
        <Tabs defaultValue="assets">
          <TabsList>
            <TabsTrigger value="assets">
              Assets ({user.totalAssets})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assets" className="mt-6">
            <Suspense fallback={<AssetGridSkeleton count={8} />}>
              {user.totalAssets > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {/* UserAssets component would go here */}
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-video rounded-lg bg-muted animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No assets yet</h3>
                  <p className="mt-2 text-muted-foreground">
                    This creator hasn't uploaded any assets yet.
                  </p>
                </div>
              )}
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}