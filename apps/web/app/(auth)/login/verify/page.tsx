'use client';

import { useSearchParams } from 'next/navigation';
import { Mail, XCircle } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  // If there's an error parameter, show error state
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 bg-mesh">
        <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
        
        <Card className="w-full max-w-md shadow-2xl animate-scale-in">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 ring-4 ring-destructive/20">
              <XCircle className="h-10 w-10 text-destructive" />
            </div>
            <CardTitle className="text-3xl font-bold">Verification Failed</CardTitle>
            <CardDescription className="text-base">
              The login link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm text-muted-foreground">
                🔒 Login links expire after 24 hours for security. Please request a
                new one to continue.
              </p>
            </div>
            <Button asChild className="w-full h-11 text-base font-semibold">
              <Link href="/login">Request New Login Link</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Default: Show "check your email" message
  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-mesh">
      <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
      
      <Card className="w-full max-w-md shadow-2xl animate-scale-in">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 ring-4 ring-primary/20 animate-pulse">
            <Mail className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">Check Your Email</CardTitle>
          <CardDescription className="text-base">
            We sent you a login link. Please check your email to sign in.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
            <p className="text-sm text-foreground">
              ✉️ Click the link in the email to sign in to your account. The link will
              expire in 24 hours.
            </p>
          </div>
          <div className="space-y-3 pt-2">
            <p className="text-xs text-center text-muted-foreground">
              Didn't receive the email? Check your spam folder or request a new link.
            </p>
            <Button asChild variant="outline" className="w-full h-11">
              <Link href="/login">Back to Login</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}