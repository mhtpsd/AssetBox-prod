import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartApi, ordersApi, downloadsApi } from '@/lib/api';
import { toast } from 'sonner';

// Cart hooks
export function useCart() {
  return useQuery({
    queryKey:  ['cart'],
    queryFn: async () => {
      const { data } = await cartApi. get();
      return data;
    },
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assetId: string) => {
      const { data } = await cartApi.addItem(assetId);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Added to cart');
    },
    onError:  (error:  any) => {
      toast.error(error.message || 'Failed to add to cart');
    },
  });
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn:  async (assetId: string) => {
      await cartApi. removeItem(assetId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Removed from cart');
    },
    onError: (error:  any) => {
      toast.error(error.message || 'Failed to remove from cart');
    },
  });
}

export function useCheckout() {
  return useMutation({
    mutationFn: async () => {
      const { data } = await cartApi.checkout();
      return data;
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location. href = data.url;
      }
    },
    onError: (error: any) => {
      toast.error(error. message || 'Failed to start checkout');
    },
  });
}

// Orders hooks
export function useOrders(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['orders', page, limit],
    queryFn: async () => {
      const { data } = await ordersApi.list({ page, limit });
      return data;
    },
  });
}

export function useOrder(orderId: string) {
  return useQuery({
    queryKey:  ['order', orderId],
    queryFn: async () => {
      const { data } = await ordersApi.get(orderId);
      return data;
    },
    enabled: !!orderId,
  });
}

// Downloads hooks
export function useMyPurchases(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['my-purchases', page, limit],
    queryFn: async () => {
      const { data } = await downloadsApi.myAssets({ page, limit });
      return data;
    },
  });
}

export function useDownloadAsset() {
  return useMutation({
    mutationFn: async (assetId: string) => {
      const { data } = await downloadsApi.getUrl(assetId);
      return data;
    },
    onSuccess: (data) => {
      // Trigger download
      const link = document.createElement('a');
      link.href = data.url;
      link.download = data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Download started');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to generate download link');
    },
  });
}