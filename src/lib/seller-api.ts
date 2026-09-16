import { apiFetch } from './api';

const useMock = import.meta.env.VITE_USE_MOCK_SELLER_API === '1';

function delay<T>(v: T, ms = 120) {
  return new Promise<T>((res) => setTimeout(() => res(v), ms));
}

export interface SellerProduct {
  id: string;
  title: string;
  slug: string;
  description: string;
  priceNgwee: number;
  originalPriceNgwee: number | null;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  categoryId: string;
  totalStock?: number;
  isLowStock?: boolean;
  images: { id: string; url: string; altText: string | null; sortOrder: number }[];
  variants: {
    id: string;
    sku: string;
    color: string | null;
    size: string | null;
    priceNgweeOverride: number | null;
    stock: number;
  }[];
}

export interface SellerOrderItem {
  id: string;
  orderId: string;
  titleSnapshot: string;
  unitPriceNgwee: number;
  quantity: number;
  lineTotalNgwee: number;
  fulfillmentStatus: 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  order: {
    id: string;
    placedAt: string;
    orderStatus: string;
    paymentStatus: string;
    shippingFullName: string;
    shippingPhone: string;
    shippingAddressLine: string;
    shippingTown: string;
  };
}

export interface OverviewStats {
  todaySalesNgwee: number;
  pendingOrderCount: number;
  lowStockProductCount: number;
  lowStockThreshold: number;
}

export interface EarningsSummary {
  grossSalesNgwee: number;
  commissionNgwee: number;
  netBalanceNgwee: number;
  thisMonthCommissionNgwee: number;
  commissionRateBps: number;
  payoutsEnabled: boolean;
  payoutStatus: string;
}

export interface CategoryOption {
  id: string;
  slug: string;
  name: string;
}

export interface CreatedStore {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  tagline: string | null;
}

const mockProduct = (): SellerProduct => ({
  id: 'prod_mock_1',
  title: 'Mock T-Shirt',
  slug: 'mock-tshirt',
  description: 'A mock product for local dev.',
  priceNgwee: 25000,
  originalPriceNgwee: null,
  status: 'ACTIVE',
  categoryId: 'cat_mock',
  totalStock: 12,
  isLowStock: false,
  images: [{ id: 'img1', url: '/public/mock-product.png', altText: 'mock', sortOrder: 0 }],
  variants: [
    { id: 'v1', sku: 'MOCK-1', color: 'Blue', size: 'M', priceNgweeOverride: null, stock: 12 },
  ],
});

const mockSellerApi = {
  getStore: () => delay({ id: 'store_mock', name: 'Mock Store', slug: 'mock-store' }),
  createStore: (body: any) => delay({ id: 'store_mock', name: body.name, slug: body.slug }),
  listProducts: (params?: { page?: number; search?: string }) =>
    delay({ products: [mockProduct()], total: 1, lowStockThreshold: 5 }),
  getProduct: (id: string) => delay(mockProduct()),
  createProduct: (body: unknown) => delay(mockProduct()),
  updateProduct: (id: string, body: unknown) => delay(mockProduct()),
  deleteProduct: (id: string) => delay(undefined),
  listOrders: (params?: { page?: number; status?: string }) => delay({ items: [], total: 0 }),
  updateItemFulfillment: (itemId: string, fulfillmentStatus: string) => delay(undefined),
  getOverview: () =>
    delay({ todaySalesNgwee: 0, pendingOrderCount: 0, lowStockProductCount: 0, lowStockThreshold: 5 }),
  getEarnings: () =>
    delay({
      grossSalesNgwee: 0,
      commissionNgwee: 0,
      netBalanceNgwee: 0,
      thisMonthCommissionNgwee: 0,
      commissionRateBps: 0,
      payoutsEnabled: false,
      payoutStatus: 'none',
    }),
  getEarningsHistory: (page = 1) => delay({ entries: [], total: 0 }),
  getAnalytics: (range = '6m') => delay({ profitSeries: [], buyerSeries: [], topProducts: [] }),
  updateProfile: (body: unknown) => delay(undefined),
  getProfile: () => delay(undefined),
  presignUpload: (filename: string, contentType: string, folder: 'products' | 'store' = 'products') =>
    delay({ key: 'mock/key', uploadUrl: null, publicUrl: '/public/mock-product.png', devMode: true }),
  listCategories: () => delay([{ id: 'cat_mock', slug: 'mock', name: 'Mock' }]),
} as const;

const realSellerApi = {
  getStore: () => apiFetch<{ id: string; name: string; slug: string }>('/api/seller/stores/me'),

  createStore: (body: { name: string; slug: string; description?: string; tagline?: string }) =>
    apiFetch<CreatedStore>('/api/seller/stores', { method: 'POST', body: JSON.stringify(body) }),

  listProducts: (params?: { page?: number; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.search) q.set('search', params.search);
    const qs = q.toString();
    return apiFetch<{ products: SellerProduct[]; total: number; lowStockThreshold: number }>(
      `/api/seller/products${qs ? `?${qs}` : ''}`,
    );
  },

  getProduct: (id: string) => apiFetch<SellerProduct>(`/api/seller/products/${id}`),

  createProduct: (body: unknown) =>
    apiFetch<SellerProduct>('/api/seller/products', { method: 'POST', body: JSON.stringify(body) }),

  updateProduct: (id: string, body: unknown) =>
    apiFetch<SellerProduct>(`/api/seller/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  deleteProduct: (id: string) => apiFetch<void>(`/api/seller/products/${id}`, { method: 'DELETE' }),

  listOrders: (params?: { page?: number; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.status) q.set('status', params.status);
    const qs = q.toString();
    return apiFetch<{ items: SellerOrderItem[]; total: number }>(`/api/seller/orders${qs ? `?${qs}` : ''}`);
  },

  updateItemFulfillment: (itemId: string, fulfillmentStatus: string) =>
    apiFetch(`/api/seller/orders/items/${itemId}/fulfillment`, {
      method: 'PATCH',
      body: JSON.stringify({ fulfillmentStatus }),
    }),

  getOverview: () => apiFetch<OverviewStats>('/api/seller/overview'),

  getEarnings: () => apiFetch<EarningsSummary>('/api/seller/earnings'),

  getEarningsHistory: (page = 1) =>
    apiFetch<{ entries: unknown[]; total: number }>(`/api/seller/earnings/history?page=${page}`),

  getAnalytics: (range = '6m') =>
    apiFetch<{
      profitSeries: { month: string; profitNgwee: number }[];
      buyerSeries: { month: string; buyerCount: number }[];
      topProducts: { title: string; units: number; revenueNgwee: number }[];
    }>(`/api/seller/analytics?range=${range}`),

  updateProfile: (body: unknown) => apiFetch('/api/seller/profile', { method: 'PATCH', body: JSON.stringify(body) }),

  getProfile: () => apiFetch('/api/seller/profile'),

  presignUpload: (filename: string, contentType: string, folder: 'products' | 'store' = 'products') =>
    apiFetch<{ key: string; uploadUrl: string | null; publicUrl: string; devMode: boolean }>(
      '/api/seller/uploads/presign',
      { method: 'POST', body: JSON.stringify({ filename, contentType, folder }) },
    ),

  listCategories: () => apiFetch<{ categories: CategoryOption[] }>('/api/categories').then((r) => r.categories),
};

export const sellerApi = useMock ? mockSellerApi : realSellerApi;
