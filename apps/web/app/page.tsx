import Link from 'next/link';
import { ArrowRight, Sparkles, Shield, Zap, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/layout/footer';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-muted/50 via-background to-background py-20 md:py-32">
        <div className="container relative z-10">
          <div className="mx-auto max-w-4xl text-center animate-fade-in">
            <div className="inline-block mb-6 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
              <span className="text-sm font-medium text-primary">✨ Welcome to AssetBox</span>
            </div>
            <h1 className="text-5xl font-bold tracking-tight md:text-7xl lg:text-8xl">
              Your Premium
              <br />
              <span className="text-gradient">Digital Marketplace</span>
            </h1>
            <p className="mt-8 text-xl text-muted-foreground md:text-2xl max-w-3xl mx-auto">
              Buy and sell high-quality digital assets from verified creators.
              Photos, videos, audio, templates, and more.
            </p>
            <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" className="text-lg h-14 px-8 shadow-lg hover-lift" asChild>
                <Link href="/search">
                  Explore Assets
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

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold">Why Choose AssetBox?</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              The best marketplace for digital creators and buyers
            </p>
          </div>

          <div className="grid gap-10 md:grid-cols-3">
            <div className="text-center p-8 rounded-2xl border bg-card hover:shadow-xl transition-all hover-lift animate-slide-up">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5">
                <Sparkles className="h-10 w-10 text-primary" />
              </div>
              <h3 className="mt-8 text-2xl font-semibold">Premium Quality</h3>
              <p className="mt-3 text-base text-muted-foreground leading-relaxed">
                Every asset is reviewed and approved by our team to ensure the highest quality standards.
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl border bg-card hover:shadow-xl transition-all hover-lift animate-slide-up" style={{ animationDelay: '100ms' }}>
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5">
                <Shield className="h-10 w-10 text-primary" />
              </div>
              <h3 className="mt-8 text-2xl font-semibold">Verified Creators</h3>
              <p className="mt-3 text-base text-muted-foreground leading-relaxed">
                All creators verify ownership of their work before listing on our secure marketplace.
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl border bg-card hover:shadow-xl transition-all hover-lift animate-slide-up" style={{ animationDelay: '200ms' }}>
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5">
                <Zap className="h-10 w-10 text-primary" />
              </div>
              <h3 className="mt-8 text-2xl font-semibold">Instant Downloads</h3>
              <p className="mt-3 text-base text-muted-foreground leading-relaxed">
                Purchase and download assets instantly. No waiting, no hassle, just quality content.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-4xl font-bold">How It Works</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Simple steps to get started
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold mb-3">Sign Up</h3>
              <p className="text-muted-foreground">
                Create your free account in seconds with magic link authentication.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold mb-3">Browse & Buy</h3>
              <p className="text-muted-foreground">
                Explore thousands of assets or upload your own creations to sell.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold mb-3">Download & Use</h3>
              <p className="text-muted-foreground">
                Get instant access to your purchases and use them in your projects.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden border-t bg-gradient-to-br from-primary via-primary to-primary/90 py-24 text-primary-foreground">
        <div className="container relative z-10">
          <div className="mx-auto max-w-3xl text-center animate-fade-in">
            <h2 className="text-5xl font-bold">Ready to Get Started?</h2>
            <p className="mt-6 text-xl text-primary-foreground/90">
              Join thousands of creators and buyers on AssetBox today.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                className="text-lg h-14 px-8 shadow-2xl hover-lift"
                asChild
              >
                <Link href="/login">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg h-14 px-8 bg-white/10 border-white/20 text-white hover:bg-white/20"
                asChild
              >
                <Link href="/search">Browse Assets</Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff1a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff1a_1px,transparent_1px)] bg-[size:14px_24px]" />
      </section>

      <Footer />
    </div>
  );
}
