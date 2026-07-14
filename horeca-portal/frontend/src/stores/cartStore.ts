'use client';

import { create } from 'zustand';
import { api } from '@/services/api';
import { CartItem } from '@/types';

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
  addItem: (productId: string, quantity?: number, note?: string) => Promise<void>;
  updateItem: (id: string, quantity?: number, note?: string) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  clearCart: () => Promise<void>;
  loadCart: () => Promise<void>;
  getTotal: () => number;
  getItemCount: () => number;
  clearError: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  addItem: async (productId: string, quantity?: number, note?: string) => {
    try {
      set({ isLoading: true, error: null });
      await api.addToCart(productId, quantity, note);
      await get().loadCart();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to add item',
        isLoading: false,
      });
    }
  },

  updateItem: async (id: string, quantity?: number, note?: string) => {
    try {
      set({ isLoading: true, error: null });
      await api.updateCartItem(id, quantity, note);
      await get().loadCart();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update item',
        isLoading: false,
      });
    }
  },

  removeItem: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      await api.removeFromCart(id);
      await get().loadCart();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to remove item',
        isLoading: false,
      });
    }
  },

  clearCart: async () => {
    try {
      set({ isLoading: true, error: null });
      await api.clearCart();
      set({ items: [], isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to clear cart',
        isLoading: false,
      });
    }
  },

  loadCart: async () => {
    try {
      set({ isLoading: true, error: null });
      const items = await api.getCart();
      set({ items, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load cart',
        isLoading: false,
      });
    }
  },

  getTotal: () => {
    return get().items.reduce((sum, item) => sum + Number(item.totalPrice), 0);
  },

  getItemCount: () => {
    return get().items.length;
  },

  clearError: () => set({ error: null }),
}));