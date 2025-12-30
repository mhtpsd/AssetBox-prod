import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function AuthLayout({
  children,
}: {
  children: React. ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Redirect to dashboard if already logged in
  if (session?.user) {
    redirect('/dashboard');
  }

  return <>{children}</>;
}