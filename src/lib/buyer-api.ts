import { apiFetch } from './api';
import type { Product } from '../types';

export interface CartApiItem {
  id: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  color?: string;
  size?: string;
  product: Product & { imageUrl?: string | null };
  lineTotal: number;
}

export const buyerApi = {
  getCart: () => apiFetch<{ items: CartApiItem[] }>('/api/cart'),

  upsertCartItem: (body: { productId: string; variantId?: string; quantity: number }) =>
    apiFetch<CartApiItem>('/api/cart', { method: 'PUT', body: JSON.stringify(body) }),

  removeCartItem: (id: string) => apiFetch<void>(`/api/cart/${id}`, { method: 'DELETE' }),

  clearCart: () => apiFetch<void>('/api/cart', { method: 'DELETE' }),

  getWishlist: () => apiFetch<{ productIds: string[] }>('/api/wishlist'),

  addWishlist: (productId: string) =>
    apiFetch<{ productId: string }>('/api/wishlist', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    }),

  removeWishlist: (productId: string) =>
    apiFetch<void>(`/api/wishlist/${productId}`, { method: 'DELETE' }),

  createOrder: (body: {
    shippingFullName: string;
    shippingPhone: string;
    shippingAddressLine: string;
    shippingTown: string;
    paymentMethod: 'AIRTEL_MONEY' | 'MTN_MOMO' | 'CARD';
    paymentPhone?: string;
  }) =>
    apiFetch<{
      order: {
        id: string;
        paymentStatus: string;
        orderStatus: string;
        totalNgwee: number;
        subtotalNgwee: number;
        deliveryFeeNgwee: number;
        simulated: boolean;
      };
    }>('/api/orders', { method: 'POST', body: JSON.stringify(body) }),
};
