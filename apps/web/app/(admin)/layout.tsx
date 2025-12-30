import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Header } from '@/components/layout/header';
import { AdminSidebar } from '@/components/layout/admin-sidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?. user) {
    redirect('/login');
  }

  if (! session. user.isAdmin) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Header />
      <div className="container flex gap-8 py-8">
        <AdminSidebar />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}