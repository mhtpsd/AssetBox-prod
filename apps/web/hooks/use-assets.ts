import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assetsApi } from '@/lib/api';
import { toast } from 'sonner';

// Get user's own uploads
export function useMyUploads(params?:  {
  status?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['my-uploads', params],
    queryFn: async () => {
      const { data } = await assetsApi.getMyUploads(params);
      return data;
    },
  });
}

// Get single asset
export function useAsset(id: string) {
  return useQuery({
    queryKey: ['asset', id],
    queryFn: async () => {
      const { data } = await assetsApi. get(id);
      return data;
    },
    enabled: !!id,
  });
}

// Create asset mutation
export function useCreateAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await assetsApi.create(formData);
      return data;
    },
    onSuccess:  () => {
      queryClient.invalidateQueries({ queryKey:  ['my-uploads'] });
    },
    onError: (error:  any) => {
      toast.error(error.message || 'Failed to create asset');
    },
  });
}

// Update asset mutation
export function useUpdateAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: FormData }) => {
      const { data } = await assetsApi.update(id, formData);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['asset', variables.id] });
      queryClient.invalidateQueries({ queryKey:  ['my-uploads'] });
      toast.success('Asset updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update asset');
    },
  });
}

// Submit asset for review
export function useSubmitAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      proof,
    }: {
      id: string;
      proof: { type: string; data: string };
    }) => {
      const { data } = await assetsApi. submit(id, proof);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient. invalidateQueries({ queryKey: ['asset', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['my-uploads'] });
      toast.success('Asset submitted for review');
    },
    onError: (error: any) => {
      toast. error(error.message || 'Failed to submit asset');
    },
  });
}

// Delete asset mutation
export function useDeleteAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await assetsApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-uploads'] });
      toast.success('Asset deleted');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete asset');
    },
  });
}

// Marketplace assets
export function useMarketplaceAssets(params?: Record<string, any>) {
  return useQuery({
    queryKey: ['marketplace', params],
    queryFn: async () => {
      const { data } = await assetsApi.list(params);
      return data;
    },
  });
}

// Search assets
export function useSearchAssets(query: string, filters?: Record<string, any>) {
  return useQuery({
    queryKey: ['search', query, filters],
    queryFn: async () => {
      const { data } = await assetsApi.search(query, filters);
      return data;
    },
    enabled: query.length > 0,
  });
}