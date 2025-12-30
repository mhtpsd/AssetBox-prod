import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar';
import { Header } from '@/components/layout/header';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?. user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Header />
      <div className="container flex gap-8 py-8">
        <DashboardSidebar />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}