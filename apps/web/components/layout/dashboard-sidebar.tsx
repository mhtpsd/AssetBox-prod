'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  LayoutDashboard,
  Upload,
  ShoppingBag,
  Download,
  Receipt,
  Wallet,
  Bell,
  Settings,
  HelpCircle,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const sidebarLinks = [
  {
    href: '/dashboard',
    label: 'Overview',
    icon: LayoutDashboard,
  },
  {
    href: '/dashboard/uploads',
    label: 'My Uploads',
    icon: Upload,
  },
  {
    href: '/dashboard/purchases',
    label: 'My Purchases',
    icon: Download,
  },
  {
    href: '/dashboard/orders',
    label: 'Order History',
    icon: Receipt,
  },
  {
    href: '/dashboard/wallet',
    label: 'Wallet',
    icon: Wallet,
  },
  {
    href: '/dashboard/notifications',
    label: 'Notifications',
    icon: Bell,
  },
  {
    href: '/dashboard/support',
    label: 'Support',
    icon: HelpCircle,
  },
  {
    href: '/dashboard/settings',
    label: 'Settings',
    icon: Settings,
  },
  {
    href: '/dashboard/support',
    label: 'Support',
    icon: HelpCircle,
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const ShieldIcon = Shield as React.ComponentType<{ className?: string }>;

  return (
    <aside className="hidden w-64 shrink-0 lg:block">
      <div className="sticky top-24">
        <nav className="space-y-1">
          {sidebarLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== '/dashboard' && pathname.startsWith(link.href));

            const Icon = link.icon as React.ComponentType<{ className?: string }>;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}

          {/* Admin Link */}
          {session?.user?.isAdmin && (
            <>
              <hr className="my-4" />
              <Link
                href="/admin"
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  pathname.startsWith('/admin')
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <ShieldIcon className="h-4 w-4" />
                Admin Panel
              </Link>
            </>
          )}
        </nav>
      </div>
    </aside>
  );
}