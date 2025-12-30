'use client';

import { ReactNode, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { SessionProvider } from '@/components/providers/session-provider';
import { useSession } from 'next-auth/react';
import { Toaster } from 'sonner';
import { useAuthStore } from '@/stores/auth-store';
import { useCartStore } from '@/stores/cart-store';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
    },
  },
});

function AuthSync({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const { setSession, setLoading } = useAuthStore();
  const { fetchCart } = useCartStore();

  useEffect(() => {
    if (status === 'loading') {
      setLoading(true);
    } else {
      setSession(session ??  null);
    }
  }, [session, status, setSession, setLoading]);

  useEffect(() => {
    if (session?. user) {
      fetchCart();
    }
  }, [session, fetchCart]);

  return <>{children}</>;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <AuthSync>{children}</AuthSync>
        <Toaster position="bottom-right" richColors />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </SessionProvider>
  );
}