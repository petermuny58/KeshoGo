import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { HTTPException } from 'hono/http-exception';
import { prisma } from '../../db.js';
import { requireAuth, type AppVariables } from '../middleware/auth.js';
import { calcDiscountPercent } from '../../utils/currency.js';

export const cartRoute = new Hono<{ Variables: AppVariables }>();

const upsertSchema = z.object({
  productId: z.string().cuid(),
  variantId: z.string().cuid().optional().nullable(),
  quantity: z.number().int().positive().max(99),
});

function mapCartItem(item: {
  id: string;
  quantity: number;
  variantId: string | null;
  product: {
    id: string;
    slug: string;
    title: string;
    priceNgwee: number;
    originalPriceNgwee: number | null;
    status: string;
    deletedAt: Date | null;
    category: { slug: string };
    images: { url: string }[];
    store: { id: string; status: string };
  };
  variant: { id: string; color: string | null; size: string | null; stock: number; priceNgweeOverride: number | null } | null;
}) {
  const unitNgwee = item.variant?.priceNgweeOverride ?? item.product.priceNgwee;
  const price = Math.round(unitNgwee / 100);
  const originalPrice =
    item.product.originalPriceNgwee != null ? Math.round(item.product.originalPriceNgwee / 100) : null;
  return {
    id: item.id,
    productId: item.product.id,
    variantId: item.variantId,
    quantity: item.quantity,
    color: item.variant?.color ?? undefined,
    size: item.variant?.size ?? undefined,
    product: {
      id: item.product.id,
      slug: item.product.slug,
      title: item.product.title,
      shortTitle: item.product.title.slice(0, 40),
      price,
      originalPrice,
      currency: 'ZMW' as const,
      rating: 0,
      reviewCount: 0,
      categorySlug: item.product.category.slug,
      storeId: item.product.store.id,
      description: '',
      imageCount: 1,
      imageUrl: item.product.images[0]?.url ?? null,
      colors: [] as string[],
      sizes: [] as string[],
      badge: null,
      discountPercent: calcDiscountPercent(price, originalPrice),
      stock: item.variant?.stock ?? 0,
      tags: [] as string[],
      reviews: [] as unknown[],
    },
    lineTotal: price * item.quantity,
  };
}

const cartInclude = {
  product: {
    include: {
      category: { select: { slug: true } },
      images: { orderBy: { sortOrder: 'asc' as const }, take: 1 },
      store: { select: { id: true, status: true } },
    },
  },
  variant: true,
} as const;

cartRoute.get('/', requireAuth, async (c) => {
  const user = c.get('user');
  const items = await prisma.cartItem.findMany({
    where: { userId: user.id },
    include: cartInclude,
    orderBy: { addedAt: 'desc' },
  });
  const available = items.filter(
    (i) => i.product.status === 'ACTIVE' && !i.product.deletedAt && i.product.store.status === 'ACTIVE',
  );
  return c.json({ items: available.map(mapCartItem) });
});

cartRoute.put('/', requireAuth, zValidator('json', upsertSchema), async (c) => {
  const user = c.get('user');
  const { productId, variantId, quantity } = c.req.valid('json');

  const product = await prisma.product.findFirst({
    where: { id: productId, status: 'ACTIVE', deletedAt: null, store: { status: 'ACTIVE' } },
    include: { variants: true },
  });
  if (!product) throw new HTTPException(404, { message: 'Product not found.' });

  let resolvedVariantId = variantId ?? null;
  if (!resolvedVariantId) {
    resolvedVariantId = product.variants[0]?.id ?? null;
  } else if (!product.variants.some((v) => v.id === resolvedVariantId)) {
    throw new HTTPException(400, { message: 'Invalid variant for this product.' });
  }
  if (!resolvedVariantId) {
    throw new HTTPException(400, { message: 'Product has no stock variants.' });
  }

  const item = await prisma.cartItem.upsert({
    where: {
      userId_productId_variantId: {
        userId: user.id,
        productId,
        variantId: resolvedVariantId,
      },
    },
    create: {
      userId: user.id,
      productId,
      variantId: resolvedVariantId,
      quantity,
    },
    update: { quantity },
    include: cartInclude,
  });

  return c.json(mapCartItem(item));
});

cartRoute.delete('/:id', requireAuth, async (c) => {
  const user = c.get('user');
  const item = await prisma.cartItem.findFirst({ where: { id: c.req.param('id'), userId: user.id } });
  if (!item) throw new HTTPException(404, { message: 'Cart item not found.' });
  await prisma.cartItem.delete({ where: { id: item.id } });
  return c.body(null, 204);
});

cartRoute.delete('/', requireAuth, async (c) => {
  const user = c.get('user');
  await prisma.cartItem.deleteMany({ where: { userId: user.id } });
  return c.body(null, 204);
});
