import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/lib/api';
import { toast } from 'sonner';

// Get current user profile
export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data } = await usersApi. getMe();
      return data;
    },
    retry: false,
  });
}

// Get current user stats
export function useUserStats() {
  return useQuery({
    queryKey: ['userStats'],
    queryFn: async () => {
      const { data } = await usersApi. getStats();
      return data;
    },
  });
}

// Get user earnings
export function useUserEarnings(days = 30) {
  return useQuery({
    queryKey: ['userEarnings', days],
    queryFn:  async () => {
      const { data } = await usersApi.getEarnings(days);
      return data;
    },
  });
}

// Get public user profile
export function useUserProfile(username: string) {
  return useQuery({
    queryKey: ['userProfile', username],
    queryFn: async () => {
      const { data } = await usersApi.getProfile(username);
      return data;
    },
    enabled: !!username,
  });
}

// Get public user's assets
export function useUserAssets(username: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: ['userAssets', username, page, limit],
    queryFn:  async () => {
      const { data } = await usersApi.getUserAssets(username, page, limit);
      return data;
    },
    enabled: !! username,
  });
}

// Update profile mutation
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn:  async (data:  {
      name?: string;
      username?:  string;
      bio?: string;
      image?: string;
    }) => {
      const response = await usersApi.updateProfile(data);
      return response. data;
    },
    onSuccess:  () => {
      queryClient.invalidateQueries({ queryKey:  ['currentUser'] });
      toast.success('Profile updated successfully');
    },
    onError: (error:  any) => {
      toast.error(error.message || 'Failed to update profile');
    },
  });
}

// Accept terms mutation
export function useAcceptTerms() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await usersApi.acceptTerms();
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      toast.success('Terms accepted');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to accept terms');
    },
  });
}