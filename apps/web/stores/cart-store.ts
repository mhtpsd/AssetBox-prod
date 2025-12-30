import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { cartApi } from '@/lib/api';
import { toast } from 'sonner';

interface CartItem {
  id: string;
  assetId: string;
  asset: {
    id:  string;
    title: string;
    price: number;
    thumbnailUrl: string | null;
    owner: {
      username: string;
    };
  };
}

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  isOpen: boolean;

  // Computed
  totalAmount:  () => number;
  itemCount: () => number;

  // Actions
  fetchCart: () => Promise<void>;
  addItem: (assetId: string) => Promise<void>;
  removeItem: (assetId: string) => Promise<void>;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      isOpen:  false,

      totalAmount: () => {
        return get().items.reduce((sum, item) => sum + item.asset.price, 0);
      },

      itemCount: () => {
        return get().items.length;
      },

      fetchCart:  async () => {
        try {
          set({ isLoading:  true });
          const { data } = await cartApi.get();
          set({ items: data.items || [], isLoading: false });
        } catch (error) {
          set({ isLoading:  false });
        }
      },

      addItem: async (assetId: string) => {
        const previousItems = get().items;

        try {
          const { data } = await cartApi. addItem(assetId);
          set({ items: data.items });
          toast.success('Added to cart');
          get().openCart();
        } catch (error:  any) {
          set({ items: previousItems });
          toast.error(error.message || 'Failed to add to cart');
          throw error;
        }
      },

      removeItem: async (assetId: string) => {
        const previousItems = get().items;
        set({ items:  previousItems.filter((item) => item.assetId !== assetId) });

        try {
          await cartApi.removeItem(assetId);
          toast.success('Removed from cart');
        } catch (error: any) {
          set({ items: previousItems });
          toast.error(error.message || 'Failed to remove from cart');
        }
      },

      clearCart: () => set({ items: [] }),

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
);