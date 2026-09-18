import type { LucideIcon } from 'lucide-react';

export type LanguageCode = 'en' | 'bem' | 'nya' | 'toi' | 'loz';

export interface Language {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
  enabled: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: LucideIcon;
}

export type ProductBadge = 'sale' | 'new' | 'bestseller' | 'low-stock' | null;

export interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  price: number;
  originalPrice: number | null;
  currency: 'ZMW';
  rating: number;
  reviewCount: number;
  categorySlug: string;
  storeId: string;
  description: string;
  imageCount: number;
  imageUrl?: string | null;
  colors: string[];
  sizes: string[];
  badge: ProductBadge;
  discountPercent: number | null;
  stock: number;
  tags: string[];
  reviews: Review[];
}

export interface Store {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  categorySlug: string;
  rating: number;
  followers: number;
  verified: boolean;
  bannerUrl?: string | null;
  logoUrl?: string | null;
  description?: string | null;
}

export interface Reel {
  id: string;
  productId: string | null;
  storeId: string;
  caption: string | null;
  likes: number;
  streamUid?: string;
  videoUrl?: string;
  thumbnailUrl?: string | null;
  iframeUrl?: string;
}

export interface Promotion {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
}

export interface CartLine {
  productId: string;
  quantity: number;
  color?: string;
  size?: string;
  variantId?: string;
}

export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest';
