'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Bell,
  Check,
  Trash2,
  CheckCheck,
  Package,
  DollarSign,
  XCircle,
  Info,
} from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { notificationsApi } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const notificationIcons:  Record<string, any> = {
  ASSET_APPROVED: Check,
  ASSET_REJECTED: XCircle,
  NEW_SALE: DollarSign,
  PAYOUT_PROCESSED: DollarSign,
  SYSTEM: Info,
};

const notificationColors: Record<string, string> = {
  ASSET_APPROVED: 'text-green-600',
  ASSET_REJECTED: 'text-red-600',
  NEW_SALE: 'text-blue-600',
  PAYOUT_PROCESSED: 'text-green-600',
  SYSTEM: 'text-gray-600',
};

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', page],
    queryFn: async () => {
      const response = await notificationsApi.list(page);
      return response. data;
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await notificationsApi.markRead(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await notificationsApi.markAllRead();
    },
    onSuccess:  () => {
      queryClient. invalidateQueries({ queryKey:  ['notifications'] });
      toast.success('All notifications marked as read');
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="mt-1 text-muted-foreground">
            Stay updated with your activity
          </p>
        </div>
        {data && data.unreadCount > 0 && (
          <Button
            variant="outline"
            onClick={() => markAllReadMutation. mutate()}
            disabled={markAllReadMutation.isPending}
          >
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array. from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : !data?.items || data.items.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="You're all caught up!  Notifications will appear here."
        />
      ) : (
        <>
          <div className="space-y-2">
            {data.items. map((notification:  any) => {
              const Icon = notificationIcons[notification.type] || Bell;
              const iconColor =
                notificationColors[notification. type] || 'text-gray-600';

              return (
                <div
                  key={notification.id}
                  className={cn(
                    'flex gap-4 rounded-lg border p-4 transition-colors',
                    ! notification.isRead ?  'bg-muted/50' : 'bg-card'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                      ! notification.isRead ?  'bg-primary/10' : 'bg-muted'
                    )}
                  >
                    <Icon className={cn('h-5 w-5', iconColor)} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3
                        className={cn(
                          'font-medium',
                          !notification.isRead && 'text-foreground'
                        )}
                      >
                        {notification.title}
                      </h3>
                      {! notification.isRead && (
                        <Badge variant="secondary" className="shrink-0">
                          New
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {notification.message}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {formatRelativeTime(notification.createdAt)}
                    </p>
                  </div>

                  {!notification. isRead && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => markReadMutation.mutate(notification.id)}
                      disabled={markReadMutation.isPending}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>

          {data.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {page} of {data.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPage((p) => Math.min(data.totalPages, p + 1))
                  }
                  disabled={page === data.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}