import { Metadata } from 'next';
import { Check, X } from 'lucide-react';

export const metadata: Metadata = {
  title: 'License Types',
  description: 'Understanding AssetBox license types and usage rights',
};

export default function LicensesPage() {
  return (
    <div className="container max-w-6xl py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold">License Types</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Understand what you can and can't do with your purchased assets
        </p>
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {/* Standard License */}
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-2xl font-bold">Standard License</h2>
          <p className="mt-2 text-3xl font-bold text-primary">Included</p>
          <p className="mt-4 text-muted-foreground">
            Perfect for personal projects and single commercial use
          </p>

          <div className="mt-6 space-y-3">
            <div className="flex items-start gap-2">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
              <span className="text-sm">Use in personal projects</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
              <span className="text-sm">Use in one commercial project</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
              <span className="text-sm">Modify and adapt</span>
            </div>
            <div className="flex items-start gap-2">
              <X className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
              <span className="text-sm">Resell or redistribute</span>
            </div>
            <div className="flex items-start gap-2">
              <X className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
              <span className="text-sm">Use in products for sale</span>
            </div>
          </div>
        </div>

        {/* Commercial License */}
        <div className="rounded-lg border-2 border-primary bg-card p-6">
          <div className="inline-block rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
            Popular
          </div>
          <h2 className="mt-4 text-2xl font-bold">Commercial License</h2>
          <p className="mt-2 text-3xl font-bold text-primary">+20%</p>
          <p className="mt-4 text-muted-foreground">
            Ideal for businesses and multiple projects
          </p>

          <div className="mt-6 space-y-3">
            <div className="flex items-start gap-2">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
              <span className="text-sm">All Standard License rights</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
              <span className="text-sm">Unlimited commercial projects</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
              <span className="text-sm">Use in products for sale</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
              <span className="text-sm">Client work</span>
            </div>
            <div className="flex items-start gap-2">
              <X className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
              <span className="text-sm">Resell as standalone product</span>
            </div>
          </div>
        </div>

        {/* Extended License */}
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-2xl font-bold">Extended License</h2>
          <p className="mt-2 text-3xl font-bold text-primary">+50%</p>
          <p className="mt-4 text-muted-foreground">
            Maximum flexibility for all use cases
          </p>

          <div className="mt-6 space-y-3">
            <div className="flex items-start gap-2">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
              <span className="text-sm">All Commercial License rights</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
              <span className="text-sm">Resale and redistribution</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
              <span className="text-sm">Use in merchandise</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
              <span className="text-sm">Physical product creation</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
              <span className="text-sm">No attribution required</span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="prose prose-gray mt-12 dark:prose-invert max-w-none">
        <h2>Important Notes</h2>
        <ul>
          <li>All licenses are perpetual - once purchased, they never expire</li>
          <li>You cannot claim copyright ownership of the original asset</li>
          <li>Attribution to the creator is appreciated but not required</li>
          <li>Licenses are non-transferable between individuals or companies</li>
          <li>Contact support if you're unsure which license you need</li>
        </ul>

        <h2>Prohibited Uses (All Licenses)</h2>
        <ul>
          <li>Claiming the asset as your own creation</li>
          <li>Using assets in illegal, defamatory, or harmful content</li>
          <li>Creating competing stock asset marketplaces</li>
          <li>Trademark registration of the asset</li>
        </ul>
      </div>
    </div>
  );
}