'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Mail } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const error = searchParams.get('error');

  // Log for debugging
  useEffect(() => {
    console.log('🔍 Login page params:', { 
      callbackUrl, 
      error, 
      status, 
      hasSession: !!session 
    });
  }, [callbackUrl, error, status, session]);

  // Redirect if already authenticated
  useEffect(() => {
    if (status === 'authenticated' && session) {
      console.log('✅ Already authenticated, redirecting to:', callbackUrl);
      router.push(callbackUrl);
    }
  }, [status, session, callbackUrl, router]);

  // Show error if any
  useEffect(() => {
    if (error) {
      console.error('❌ Login error:', error);
      if (error === 'Verification') {
        toast.error('The sign-in link has expired or was already used.  Please request a new one.');
      } else if (error === 'Configuration') {
        toast.error('Server configuration error. Please contact support.');
      } else if (error === 'AccessDenied') {
        toast.error('Access denied. Please try again.');
      } else if (error === 'EmailSignin') {
        toast.error('Failed to send email. Please try again.');
      } else {
        toast.error(`An error occurred: ${error}. Please try again.`);
      }
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn('email', {
        email,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        toast.error('Failed to send login link.  Please try again.');
      } else {
        toast.success('Check your email for the login link! ');
        router.push('/login/verify');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking auth status
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-mesh">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Don't render if already authenticated
  if (status === 'authenticated') {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-mesh">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
      
      <Card className="w-full max-w-md shadow-2xl animate-slide-up">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto w-fit p-3 bg-primary/10 rounded-full mb-2">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">Welcome to AssetBox</CardTitle>
          <CardDescription className="text-base">
            Sign in with your email to access premium digital assets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                className="h-11"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11 text-base font-semibold"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              {!isLoading && <Mail className="mr-2 h-5 w-5" />}
              {isLoading ? 'Sending magic link...' : 'Send Magic Link'}
            </Button>
            
            <p className="text-xs text-center text-muted-foreground pt-2">
              We'll send you a secure login link to your email
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}