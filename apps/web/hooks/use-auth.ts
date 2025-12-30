'use client';

import { useSession, signIn, signOut } from 'next-auth/react';

export function useAuth() {
  const { data: session, status } = useSession();

  const isAuthenticated = !!session?. user;
  const isLoading = status === 'loading';
  const user = session?.user;
  const isAdmin = session?.user?.isAdmin ??  false;

  const login = async (email: string) => {
    return signIn('email', { email, redirect: false });
  };

  const logout = async () => {
    return signOut({ redirect: true, callbackUrl: '/' });
  };

  return {
    user,
    session,
    isAuthenticated,
    isLoading,
    isAdmin,
    login,
    logout,
  };
}