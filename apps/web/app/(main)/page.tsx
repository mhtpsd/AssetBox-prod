import Link from 'next/link';
import { ArrowRight, Sparkles, Shield, Zap } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { AssetGridSkeleton } from '@/components/shared/loading-skeleton';
import { Suspense } from 'react';

// Featured categories
const categories = [
  {
    name: 'Photos',
    slug: 'photos',
    image: '/categories/photos.jpg',
    count: '10,000+',
  },
  {
    name: 'Videos',
    slug: 'videos',
    image: '/categories/videos.jpg',
    count:  '5,000+',
  },
  {
    name: 'Audio',
    slug: 'audio',
    image: '/categories/audio.jpg',
    count: '3,000+',
  },
  {
    name: 'Templates',
    slug: 'templates',
    image:  '/categories/templates. jpg',
    count: '2,000+',
  },
  {
    name: '3D Assets',
    slug: '3d',
    image: '/categories/3d. jpg',
    count: '1,000+',
  },
  {
    name:  'Illustrations',
    slug:  'illustrations',
    image: '/categories/illustrations.jpg',
    count: '4,000+',
  },
];

const features = [
  {
    icon:  Sparkles,
    title: 'Premium Quality',
    description:  'Every asset is reviewed and approved by our team to ensure the highest quality.',
  },
  {
    icon:  Shield,
    title: 'Verified Creators',
    description: 'All creators verify ownership of their work before listing on our marketplace.',
  },
  {
    icon: Zap,
    title: 'Instant Downloads',
    description:  'Purchase and download assets instantly.  No waiting, no hassle.',
  },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-muted/50 to-background py-20 md:py-32">
        <div className="container relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
              Premium Digital Assets from{' '}
              <span className="text-primary">Verified Creators</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              Discover thousands of high-quality photos, videos, audio files,
              templates, and more.  All verified for authenticity and quality. 
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" asChild>
                <Link href="/search">
                  Browse Assets
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">Start Selling</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
      </section>

      {/* Categories Section */}
      <section className="py-20">
        <div className="container">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">Browse by Category</h2>
              <p className="mt-2 text-muted-foreground">
                Find the perfect assets for your project
              </p>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/search">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/category/${category.slug}`}
                className="group relative overflow-hidden rounded-lg border bg-card p-6 transition-all hover:shadow-lg"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 h-16 w-16 rounded-full bg-primary/10" />
                  <h3 className="font-semibold">{category.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {category.count} assets
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Assets Section */}
      <section className="border-t bg-muted/30 py-20">
        <div className="container">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">Featured Assets</h2>
              <p className="mt-2 text-muted-foreground">
                Hand-picked by our team
              </p>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/search? sort=popular">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="mt-10">
            <Suspense fallback={<AssetGridSkeleton count={8} />}>
              {/* FeaturedAssets component would go here */}
              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {/* Placeholder cards */}
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-video rounded-lg bg-muted animate-pulse"
                  />
                ))}
              </div>
            </Suspense>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold">Why Choose AssetBox?</h2>
            <p className="mt-4 text-muted-foreground">
              We're committed to providing the best marketplace experience for
              both buyers and creators.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {features.map((feature) => (
              <div key={feature. title} className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mt-6 text-xl font-semibold">{feature.title}</h3>
                <p className="mt-2 text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-primary py-20 text-primary-foreground">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold">Start Selling Your Assets</h2>
            <p className="mt-4 text-primary-foreground/80">
              Join thousands of creators earning money from their digital assets. 
              Easy uploads, fair pricing, and fast payouts.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="mt-8"
              asChild
            >
              <Link href="/login">
                Become a Creator
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}