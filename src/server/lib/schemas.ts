import { z } from 'zod';

// Money fields are always integers in ngwee (1 ZMW = 100 ngwee) — the API
// never accepts or returns floats for a price, matching the DB convention.
const ngwee = z.number().int().nonnegative();

/** Public asset URLs only — reject data: / blob: so we never persist local previews. */
export const httpUrl = z
  .string()
  .url()
  .refine((u) => /^https?:\/\//i.test(u), 'must be an http(s) URL');

export const createStoreSchema = z.object({
  name: z.string().trim().min(3).max(80),
  slug: z
    .string()
    .trim()
    .min(3)
    .max(60)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'slug must be lowercase, alphanumeric, hyphen-separated'),
  tagline: z.string().trim().max(140).optional(),
  description: z.string().trim().max(2000).optional(),
  bannerUrl: httpUrl.optional(),
  logoUrl: httpUrl.optional(),
  pacraNumber: z.string().trim().max(40).optional(),
  tpin: z.string().trim().max(40).optional(),
  payoutPhone: z.string().trim().max(20).optional(),
  payoutMethod: z.enum(['AIRTEL_MONEY', 'MTN_MOMO', 'CARD']).optional(),
});

export const updateStoreSchema = createStoreSchema.partial().omit({ slug: true });

export const updateStoreProfileSchema = updateStoreSchema;

export const createReelSchema = z.object({
  streamUid: z.string().trim().min(1).max(64),
  caption: z.string().trim().max(500).optional(),
  productId: z.string().cuid().optional(),
  thumbnailUrl: httpUrl.optional(),
});

export const reviewReplySchema = z.object({
  sellerReply: z.string().trim().min(1).max(2000),
});

const productVariantInput = z.object({
  sku: z.string().trim().min(1).max(40),
  color: z.string().trim().max(40).optional(),
  size: z.string().trim().max(20).optional(),
  priceNgweeOverride: ngwee.optional(),
  stock: z.number().int().nonnegative(),
});

const productImageInput = z.object({
  url: httpUrl,
  altText: z.string().trim().max(140).optional(),
  sortOrder: z.number().int().nonnegative().default(0),
});

export const createProductSchema = z.object({
  categoryId: z.string().cuid(),
  slug: z
    .string()
    .trim()
    .min(3)
    .max(100)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'slug must be lowercase, alphanumeric, hyphen-separated'),
  title: z.string().trim().min(3).max(140),
  description: z.string().trim().min(10).max(4000),
  priceNgwee: ngwee,
  originalPriceNgwee: ngwee.optional(),
  images: z.array(productImageInput).min(1, 'at least one product image is required'),
  // A product with no explicit variants still needs stock tracked somewhere —
  // callers that don't use color/size options must send exactly one variant
  // with an empty color/size, so stock always lives in ProductVariant, never
  // as a bare number on Product itself.
  variants: z.array(productVariantInput).min(1, 'at least one variant (even a default one) is required'),
});

export const updateProductSchema = createProductSchema
  .omit({ slug: true })
  .partial()
  .extend({
    status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).optional(),
    badge: z.enum(['SALE', 'NEW', 'BESTSELLER']).nullable().optional(),
    images: z.array(productImageInput).optional(),
    variants: z.array(productVariantInput.extend({ id: z.string().cuid().optional() })).optional(),
  });

export const updateFulfillmentSchema = z.object({
  fulfillmentStatus: z.enum(['PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
});
