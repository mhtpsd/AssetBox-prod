'use client';

import { useSearchParams } from 'next/navigation';
import { XCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const errorMessages:  Record<string, string> = {
  Configuration: 'There is a problem with the server configuration.',
  AccessDenied: 'You do not have permission to sign in.',
  Verification: 'The login link is invalid or has expired.',
  Default: 'An error occurred during sign in.',
};

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error') || 'Default';
  const errorMessage = errorMessages[error] || errorMessages.Default;

  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-mesh">
      <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
      
      <Card className="w-full max-w-md shadow-2xl animate-scale-in">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 ring-4 ring-destructive/20">
            {error === 'Verification' ?  (
              <AlertTriangle className="h-10 w-10 text-amber-500" />
            ) : (
              <XCircle className="h-10 w-10 text-destructive" />
            )}
          </div>
          <CardTitle className="text-3xl font-bold">Authentication Error</CardTitle>
          <CardDescription className="text-base">{errorMessage}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">
              {error === 'Configuration' && '⚙️ Please contact support if this issue persists.'}
              {error === 'AccessDenied' && '🚫 Your account may not have access to this resource.'}
              {error === 'Verification' && '⏰ This link may have expired. Please request a new one.'}
              {error === 'Default' && '❌ Something went wrong during authentication.'}
            </p>
          </div>
          <Button asChild className="w-full h-11 text-base font-semibold">
            <Link href="/login">Try Again</Link>
          </Button>
          <Button asChild variant="outline" className="w-full h-11">
            <Link href="/">Go to Homepage</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}