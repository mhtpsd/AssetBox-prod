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
      <section className="relative overflow-hidden bg-gradient-to-b from-muted/50 via-background to-background py-20 md:py-32">
        <div className="container relative z-10">
          <div className="mx-auto max-w-4xl text-center animate-fade-in">
            <div className="inline-block mb-4 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
              <span className="text-sm font-medium text-primary">✨ Premium Digital Marketplace</span>
            </div>
            <h1 className="text-5xl font-bold tracking-tight md:text-7xl lg:text-8xl">
              Premium Digital Assets from{' '}
              <span className="text-gradient">Verified Creators</span>
            </h1>
            <p className="mt-8 text-xl text-muted-foreground md:text-2xl max-w-3xl mx-auto">
              Discover thousands of high-quality photos, videos, audio files,
              templates, and more. All verified for authenticity and quality. 
            </p>
            <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" className="text-lg h-14 px-8 shadow-lg hover-lift" asChild>
                <Link href="/search">
                  Browse Assets
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg h-14 px-8" asChild>
                <Link href="/login">Start Selling</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 h-full w-full bg-mesh" />
        <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="flex items-center justify-between mb-12 animate-slide-up">
            <div>
              <h2 className="text-4xl font-bold">Browse by Category</h2>
              <p className="mt-3 text-lg text-muted-foreground">
                Find the perfect assets for your project
              </p>
            </div>
            <Button variant="ghost" asChild className="text-base">
              <Link href="/search">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {categories.map((category, index) => (
              <Link
                key={category.slug}
                href={`/category/${category.slug}`}
                className="group relative overflow-hidden rounded-xl border bg-card p-8 transition-all hover:shadow-2xl hover-lift animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <div className="h-10 w-10 rounded-full bg-primary/30" />
                  </div>
                  <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{category.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
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
          <div className="flex items-center justify-between mb-12 animate-slide-up">
            <div>
              <h2 className="text-4xl font-bold">Featured Assets</h2>
              <p className="mt-3 text-lg text-muted-foreground">
                Hand-picked by our team
              </p>
            </div>
            <Button variant="ghost" asChild className="text-base">
              <Link href="/search?sort=popular">
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
                    className="aspect-video rounded-xl bg-gradient-to-br from-muted to-muted/50 animate-pulse hover-lift"
                  />
                ))}
              </div>
            </Suspense>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold">Why Choose AssetBox?</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              We're committed to providing the best marketplace experience for
              both buyers and creators.
            </p>
          </div>

          <div className="grid gap-10 md:grid-cols-3">
            {features.map((feature, index) => (
              <div 
                key={feature.title} 
                className="text-center p-8 rounded-2xl border bg-card hover:shadow-xl transition-all hover-lift animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5">
                  <feature.icon className="h-10 w-10 text-primary" />
                </div>
                <h3 className="mt-8 text-2xl font-semibold">{feature.title}</h3>
                <p className="mt-3 text-base text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden border-t bg-gradient-to-br from-primary via-primary to-primary/90 py-24 text-primary-foreground">
        <div className="container relative z-10">
          <div className="mx-auto max-w-3xl text-center animate-fade-in">
            <h2 className="text-5xl font-bold">Start Selling Your Assets</h2>
            <p className="mt-6 text-xl text-primary-foreground/90">
              Join thousands of creators earning money from their digital assets. 
              Easy uploads, fair pricing, and fast payouts.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="mt-10 text-lg h-14 px-8 shadow-2xl hover-lift"
              asChild
            >
              <Link href="/login">
                Become a Creator
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff1a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff1a_1px,transparent_1px)] bg-[size:14px_24px]" />
      </section>
    </div>
  );
}