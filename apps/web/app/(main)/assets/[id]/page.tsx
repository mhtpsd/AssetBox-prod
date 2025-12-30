import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  Download,
  Eye,
  Calendar,
  Tag,
  FileIcon,
  ShoppingCart,
  Heart,
  Share2,
  Shield,
  Check,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatPrice, formatDate, getInitials } from '@/lib/utils';
import { AddToCartButton } from '@/components/assets/add-to-cart-button';

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function bytesToSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
}

interface Props {
  params:  { id: string };
}

async function getAsset(id:  string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/assets/${id}`,
      { cache: 'no-store' }
    );

    if (!res. ok) return null;

    const data = await res. json();
    return data. data;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const asset = await getAsset(params.id);

  if (!asset) {
    return { title: 'Asset Not Found' };
  }

  return {
    title:  asset.title,
    description: asset. description. slice(0, 160),
    openGraph: {
      title: asset.title,
      description: asset.description. slice(0, 160),
      images: asset.thumbnailUrl ?  [asset.thumbnailUrl] : [],
    },
  };
}

export default async function AssetDetailPage({ params }: Props) {
  const asset = await getAsset(params.id);

  if (!asset) {
    notFound();
  }

  const isFree = asset.price === 0;

  return (
    <div className="container py-8">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Preview Image */}
          <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
            {asset.previewUrl || asset.thumbnailUrl ? (
              <Image
                src={asset.previewUrl || asset.thumbnailUrl}
                alt={asset.title}
                fill
                className="object-contain"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <FileIcon className="h-16 w-16 text-muted-foreground" />
              </div>
            )}

            {/* Watermark notice */}
            {! isFree && (
              <div className="absolute bottom-4 left-4 right-4">
                <div className="rounded-lg bg-black/70 px-4 py-2 text-center text-sm text-white">
                  Preview image.  Purchase to download full quality.
                </div>
              </div>
            )}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="description">
            <TabsList>
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="files">Files</TabsTrigger>
              <TabsTrigger value="license">License</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-4">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <p className="whitespace-pre-wrap">{asset.description}</p>
              </div>

              {/* Tags */}
              {asset.tags && asset.tags.length > 0 && (
                <div className="mt-6">
                  <h3 className="flex items-center gap-2 text-sm font-medium">
                    <Tag className="h-4 w-4" />
                    Tags
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {asset.tags.map((tag:  string) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="files" className="mt-4">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Files included in this download: 
                </p>
                <div className="space-y-2">
                  {asset.files?. map((file: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <FileIcon className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">. {file.fileFormat. toUpperCase()}</p>
                          <p className="text-sm text-muted-foreground">
                            {file.mimeType}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {bytesToSize(file.fileSize)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="license" className="mt-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">{asset.licenseType} License</h3>
                </div>

                <div className="rounded-lg bg-muted/50 p-4">
                  {asset.licenseType === 'STANDARD' && (
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        Use in personal projects
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        Use in a single commercial project
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        Modify and adapt for your needs
                      </li>
                    </ul>
                  )}
                  {asset. licenseType === 'COMMERCIAL' && (
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        Everything in Standard License
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        Use in unlimited commercial projects
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        Use in products for sale
                      </li>
                    </ul>
                  )}
                  {asset.licenseType === 'EXTENDED' && (
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        Everything in Commercial License
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        Resale and distribution rights
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        Use in merchandise and physical products
                      </li>
                    </ul>
                  )}
                </div>

                <p className="text-xs text-muted-foreground">
                  By purchasing this asset, you agree to our{' '}
                  <Link href="/licenses" className="text-primary hover:underline">
                    License Terms
                  </Link>
                  . 
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Purchase Card */}
          <div className="sticky top-24 rounded-lg border bg-card p-6">
            <div className="space-y-4">
              {/* Price */}
              <div>
                <span className="text-3xl font-bold">
                  {isFree ? 'Free' : formatPrice(asset.price)}
                </span>
                {! isFree && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {asset.licenseType} License
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <AddToCartButton assetId={asset.id} isFree={isFree} />

                <div className="flex gap-2">
                  <Button variant="outline" size="icon" className="flex-1">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="flex-1">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{formatNumber(asset.viewCount)}</p>
                  <p className="text-xs text-muted-foreground">Views</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatNumber(asset.totalDownloads)}</p>
                  <p className="text-xs text-muted-foreground">Downloads</p>
                </div>
              </div>

              <Separator />

              {/* Meta */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <span>{asset.assetType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <span>{asset.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Published</span>
                  <span>{formatDate(asset.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Creator Card */}
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-sm font-medium text-muted-foreground">Creator</h3>
            <Link
              href={`/user/${asset.owner.username}`}
              className="mt-4 flex items-center gap-3"
            >
              <Avatar className="h-12 w-12">
                <AvatarImage src={asset.owner.image || undefined} />
                <AvatarFallback>
                  {getInitials(asset. owner.name || asset.owner.username)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{asset.owner. name || asset.owner.username}</p>
                <p className="text-sm text-muted-foreground">@{asset.owner. username}</p>
              </div>
            </Link>
            <Button variant="outline" className="mt-4 w-full" asChild>
              <Link href={`/user/${asset.owner.username}`}>View Profile</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}