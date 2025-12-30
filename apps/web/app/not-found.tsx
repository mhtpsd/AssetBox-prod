import Link from 'next/link';
import { FileQuestion } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-muted">
          <FileQuestion className="h-12 w-12 text-muted-foreground" />
        </div>
        <h1 className="mt-6 text-4xl font-bold">404</h1>
        <h2 className="mt-2 text-xl font-semibold">Page Not Found</h2>
        <p className="mt-4 max-w-md text-muted-foreground">
          Sorry, we couldn't find the page you're looking for.  It might have been
          moved or deleted.
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/search">Browse Assets</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}