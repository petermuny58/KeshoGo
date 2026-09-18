import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { HTTPException } from 'hono/http-exception';
import { prisma } from '../../db.js';
import { requireAuth, type AppVariables } from '../middleware/auth.js';
import { calcDiscountPercent } from '../../utils/currency.js';
import { streamPlaybackUrls } from '../lib/stream.js';

export const publicCatalogRoute = new Hono<{ Variables: AppVariables }>();

const searchQuery = z.object({
  q: z.string().trim().min(1).max(120),
});

function mapProduct(p: {
  id: string;
  slug: string;
  title: string;
  description: string;
  priceNgwee: number;
  originalPriceNgwee: number | null;
  ratingAvg: { toNumber?: () => number } | number | string;
  reviewCount: number;
  badge: string | null;
  storeId: string;
  category: { slug: string };
  images: { url: string }[];
  variants: { stock: number; color: string | null; size: string | null }[];
}) {
  const price = Math.round(p.priceNgwee / 100);
  const originalPrice = p.originalPriceNgwee != null ? Math.round(p.originalPriceNgwee / 100) : null;
  const rating =
    typeof p.ratingAvg === 'object' && p.ratingAvg && 'toNumber' in p.ratingAvg
      ? p.ratingAvg.toNumber!()
      : Number(p.ratingAvg);
  const stock = p.variants.reduce((s, v) => s + v.stock, 0);
  const badgeMap: Record<string, 'sale' | 'new' | 'bestseller'> = {
    SALE: 'sale',
    NEW: 'new',
    BESTSELLER: 'bestseller',
  };
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    shortTitle: p.title.slice(0, 40),
    price,
    originalPrice,
    currency: 'ZMW' as const,
    rating,
    reviewCount: p.reviewCount,
    categorySlug: p.category.slug,
    storeId: p.storeId,
    description: p.description,
    imageCount: Math.max(1, p.images.length),
    imageUrl: p.images[0]?.url ?? null,
    colors: [...new Set(p.variants.map((v) => v.color).filter(Boolean))] as string[],
    sizes: [...new Set(p.variants.map((v) => v.size).filter(Boolean))] as string[],
    badge: p.badge ? (badgeMap[p.badge] ?? null) : stock > 0 && stock <= 5 ? ('low-stock' as const) : null,
    discountPercent: calcDiscountPercent(price, originalPrice),
    stock,
    tags: [] as string[],
    reviews: [] as unknown[],
  };
}

function mapStore(s: {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  bannerUrl: string | null;
  logoUrl: string | null;
  verified: boolean;
  followerCount: number;
  ratingAvg: { toNumber?: () => number } | number | string;
}) {
  const rating =
    typeof s.ratingAvg === 'object' && s.ratingAvg && 'toNumber' in s.ratingAvg
      ? s.ratingAvg.toNumber!()
      : Number(s.ratingAvg);
  return {
    id: s.id,
    name: s.name,
    slug: s.slug,
    tagline: s.tagline ?? '',
    description: s.description,
    bannerUrl: s.bannerUrl,
    logoUrl: s.logoUrl,
    categorySlug: 'general',
    rating,
    followers: s.followerCount,
    verified: s.verified,
  };
}

const productInclude = {
  category: { select: { slug: true, name: true } },
  images: { orderBy: { sortOrder: 'asc' as const }, take: 1 },
  variants: { select: { stock: true, color: true, size: true } },
} as const;

const productDetailInclude = {
  category: { select: { slug: true, name: true } },
  images: { orderBy: { sortOrder: 'asc' as const } },
  variants: true,
  store: {
    select: {
      id: true,
      name: true,
      slug: true,
      tagline: true,
      verified: true,
      logoUrl: true,
      followerCount: true,
      ratingAvg: true,
    },
  },
  reviews: {
    take: 20,
    orderBy: { createdAt: 'desc' as const },
    include: { user: { select: { fullName: true } } },
  },
} as const;

publicCatalogRoute.get(
  '/products',
  zValidator(
    'query',
    z.object({
      category: z.string().trim().optional(),
      badge: z.enum(['SALE', 'NEW', 'BESTSELLER']).optional(),
      sort: z.enum(['newest', 'rating', 'featured']).optional(),
      limit: z.coerce.number().int().min(1).max(60).optional(),
    }),
  ),
  async (c) => {
    const { category, badge, sort, limit = 24 } = c.req.valid('query');
    const products = await prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        deletedAt: null,
        store: { status: 'ACTIVE' },
        ...(category ? { category: { slug: category } } : {}),
        ...(badge ? { badge } : {}),
      },
      include: productInclude,
      take: limit,
      orderBy:
        sort === 'rating'
          ? { ratingAvg: 'desc' }
          : sort === 'newest'
            ? { createdAt: 'desc' }
            : [{ badge: 'asc' }, { ratingAvg: 'desc' }],
    });
    return c.json({ products: products.map(mapProduct) });
  },
);

publicCatalogRoute.get('/products/:slug', async (c) => {
  const product = await prisma.product.findFirst({
    where: {
      slug: c.req.param('slug'),
      status: 'ACTIVE',
      deletedAt: null,
      store: { status: 'ACTIVE' },
    },
    include: productDetailInclude,
  });
  if (!product) throw new HTTPException(404, { message: 'Product not found.' });

  const mapped = mapProduct({
    ...product,
    images: product.images,
    variants: product.variants,
  });

  const related = await prisma.product.findMany({
    where: {
      status: 'ACTIVE',
      deletedAt: null,
      store: { status: 'ACTIVE' },
      categoryId: product.categoryId,
      id: { not: product.id },
    },
    include: productInclude,
    take: 8,
    orderBy: { ratingAvg: 'desc' },
  });

  return c.json({
    product: {
      ...mapped,
      images: product.images.map((img) => ({ id: img.id, url: img.url, altText: img.altText })),
      variants: product.variants.map((v) => ({
        id: v.id,
        sku: v.sku,
        color: v.color,
        size: v.size,
        stock: v.stock,
        priceNgweeOverride: v.priceNgweeOverride,
      })),
      reviews: product.reviews.map((r) => ({
        id: r.id,
        author: r.user.fullName,
        rating: r.rating,
        comment: r.comment,
        date: r.createdAt.toISOString().slice(0, 10),
      })),
      store: mapStore({
        id: product.store.id,
        name: product.store.name,
        slug: product.store.slug,
        tagline: product.store.tagline,
        description: null,
        bannerUrl: null,
        logoUrl: product.store.logoUrl,
        verified: product.store.verified,
        followerCount: product.store.followerCount,
        ratingAvg: product.store.ratingAvg,
      }),
    },
    related: related.map(mapProduct),
  });
});

publicCatalogRoute.get('/stores', zValidator('query', z.object({ q: z.string().trim().optional() })), async (c) => {
  const { q } = c.req.valid('query');
  const stores = await prisma.store.findMany({
    where: {
      status: 'ACTIVE',
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { tagline: { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    orderBy: { followerCount: 'desc' },
    take: 40,
  });
  return c.json({ stores: stores.map(mapStore) });
});

publicCatalogRoute.get('/stores/:slug', async (c) => {
  const store = await prisma.store.findFirst({
    where: { slug: c.req.param('slug'), status: 'ACTIVE' },
  });
  if (!store) throw new HTTPException(404, { message: 'Store not found.' });

  const products = await prisma.product.findMany({
    where: { storeId: store.id, status: 'ACTIVE', deletedAt: null },
    include: productInclude,
    orderBy: { createdAt: 'desc' },
  });

  return c.json({
    store: mapStore(store),
    products: products.map(mapProduct),
  });
});

publicCatalogRoute.get('/search', zValidator('query', searchQuery), async (c) => {
  const { q } = c.req.valid('query');

  const [stores, products] = await Promise.all([
    prisma.store.findMany({
      where: {
        status: 'ACTIVE',
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { tagline: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 20,
      orderBy: { followerCount: 'desc' },
    }),
    prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        deletedAt: null,
        store: { status: 'ACTIVE' },
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      },
      include: productInclude,
      take: 40,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return c.json({
    stores: stores.map(mapStore),
    products: products.map(mapProduct),
  });
});

publicCatalogRoute.get('/reels', async (c) => {
  const reels = await prisma.reel.findMany({
    where: { store: { status: 'ACTIVE' } },
    include: {
      store: {
        select: {
          id: true,
          name: true,
          slug: true,
          logoUrl: true,
          verified: true,
        },
      },
      product: {
        include: {
          category: { select: { slug: true } },
          images: { orderBy: { sortOrder: 'asc' }, take: 1 },
          variants: { select: { stock: true, color: true, size: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return c.json({
    reels: reels.map((r) => {
      const urls = streamPlaybackUrls(r.streamUid);
      return {
        id: r.id,
        streamUid: r.streamUid,
        videoUrl: r.videoUrl || urls.videoUrl,
        thumbnailUrl: r.thumbnailUrl ?? urls.thumbnailUrl,
        iframeUrl: urls.iframeUrl,
        caption: r.caption,
        likes: r.likeCount,
        storeId: r.storeId,
        productId: r.productId,
        store: {
          id: r.store.id,
          name: r.store.name,
          slug: r.store.slug,
          logoUrl: r.store.logoUrl,
          verified: r.store.verified,
        },
        product: r.product
          ? {
              id: r.product.id,
              slug: r.product.slug,
              title: r.product.title,
              price: Math.round(r.product.priceNgwee / 100),
              categorySlug: r.product.category.slug,
              imageUrl: r.product.images[0]?.url ?? null,
            }
          : null,
      };
    }),
  });
});

publicCatalogRoute.post('/reels/:id/like', requireAuth, async (c) => {
  const user = c.get('user');
  const reelId = c.req.param('id');
  const reel = await prisma.reel.findUnique({ where: { id: reelId } });
  if (!reel) throw new HTTPException(404, { message: 'Reel not found.' });

  const existing = await prisma.reelLike.findUnique({
    where: { reelId_userId: { reelId, userId: user.id } },
  });

  if (existing) {
    await prisma.$transaction([
      prisma.reelLike.delete({ where: { id: existing.id } }),
      prisma.reel.update({ where: { id: reelId }, data: { likeCount: { decrement: 1 } } }),
    ]);
    const updated = await prisma.reel.findUniqueOrThrow({ where: { id: reelId } });
    return c.json({ liked: false, likeCount: Math.max(0, updated.likeCount) });
  }

  await prisma.$transaction([
    prisma.reelLike.create({ data: { reelId, userId: user.id } }),
    prisma.reel.update({ where: { id: reelId }, data: { likeCount: { increment: 1 } } }),
  ]);
  const updated = await prisma.reel.findUniqueOrThrow({ where: { id: reelId } });
  return c.json({ liked: true, likeCount: updated.likeCount });
});
