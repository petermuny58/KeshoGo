import { apiFetch } from './api';
import type { Product, Store, Review } from '../types';

export interface CatalogStore extends Store {
  description?: string | null;
  bannerUrl?: string | null;
  logoUrl?: string | null;
}

export interface CatalogProduct extends Product {
  imageUrl?: string | null;
}

export interface CatalogProductDetail extends CatalogProduct {
  images: { id: string; url: string; altText: string | null }[];
  variants: {
    id: string;
    sku: string;
    color: string | null;
    size: string | null;
    stock: number;
    priceNgweeOverride: number | null;
  }[];
  reviews: Review[];
  store: CatalogStore;
}

export interface CatalogCategory {
  id: string;
  slug: string;
  name: string;
  icon: string;
}

export interface CatalogReel {
  id: string;
  streamUid: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  iframeUrl: string;
  caption: string | null;
  likes: number;
  storeId: string;
  productId: string | null;
  store: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    verified: boolean;
  };
  product: {
    id: string;
    slug: string;
    title: string;
    price: number;
    categorySlug: string;
    imageUrl: string | null;
  } | null;
}

export const catalogApi = {
  search: (q: string) =>
    apiFetch<{ stores: CatalogStore[]; products: CatalogProduct[] }>(
      `/api/search?q=${encodeURIComponent(q)}`,
    ),

  getStore: (slug: string) =>
    apiFetch<{ store: CatalogStore; products: CatalogProduct[] }>(`/api/stores/${encodeURIComponent(slug)}`),

  listProducts: (params?: {
    category?: string;
    badge?: 'SALE' | 'NEW' | 'BESTSELLER';
    sort?: 'newest' | 'rating' | 'featured';
    limit?: number;
  }) => {
    const q = new URLSearchParams();
    if (params?.category) q.set('category', params.category);
    if (params?.badge) q.set('badge', params.badge);
    if (params?.sort) q.set('sort', params.sort);
    if (params?.limit) q.set('limit', String(params.limit));
    const qs = q.toString();
    return apiFetch<{ products: CatalogProduct[] }>(`/api/products${qs ? `?${qs}` : ''}`);
  },

  getProduct: (slug: string) =>
    apiFetch<{ product: CatalogProductDetail; related: CatalogProduct[] }>(
      `/api/products/${encodeURIComponent(slug)}`,
    ),

  listCategories: () => apiFetch<{ categories: CatalogCategory[] }>('/api/categories'),

  listReels: () => apiFetch<{ reels: CatalogReel[] }>('/api/reels'),

  toggleReelLike: (id: string) =>
    apiFetch<{ liked: boolean; likeCount: number }>(`/api/reels/${id}/like`, { method: 'POST' }),
};
