import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="text-xl font-bold">
              AssetBox
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Premium digital assets from verified creators.  Photos, videos,
              audio, templates, and more. 
            </p>
          </div>

          {/* Browse */}
          <div>
            <h3 className="font-semibold">Browse</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/category/photos" className="hover:text-foreground">
                  Photos
                </Link>
              </li>
              <li>
                <Link href="/category/videos" className="hover:text-foreground">
                  Videos
                </Link>
              </li>
              <li>
                <Link href="/category/audio" className="hover: text-foreground">
                  Audio
                </Link>
              </li>
              <li>
                <Link href="/category/templates" className="hover:text-foreground">
                  Templates
                </Link>
              </li>
              <li>
                <Link href="/category/3d" className="hover:text-foreground">
                  3D Assets
                </Link>
              </li>
            </ul>
          </div>

          {/* Creators */}
          <div>
            <h3 className="font-semibold">Creators</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/sell" className="hover:text-foreground">
                  Start Selling
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-foreground">
                  Creator Dashboard
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover: text-foreground">
                  Pricing & Fees
                </Link>
              </li>
              <li>
                <Link href="/guidelines" className="hover: text-foreground">
                  Content Guidelines
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold">Company</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-muted-foreground hover:text-foreground">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/licenses" className="text-muted-foreground hover:text-foreground">
                  Licenses
                </Link>
              </li>
              <li>
                <Link href="/dashboard/support" className="text-muted-foreground hover:text-foreground">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold">Legal</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/terms" className="hover: text-foreground">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/licenses" className="hover: text-foreground">
                  License Terms
                </Link>
              </li>
              <li>
                <Link href="/dmca" className="hover:text-foreground">
                  DMCA Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} AssetBox. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            All sales are final. No refunds. 
          </p>
        </div>
      </div>
    </footer>
  );
}