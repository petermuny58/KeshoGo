import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { HTTPException } from 'hono/http-exception';
import { z } from 'zod';
import { prisma } from '../../db.js';
import { requireAuth, requireSeller, type AppVariables } from '../middleware/auth.js';
import { createProductSchema, updateProductSchema } from '../lib/schemas.js';
import { isUniqueConstraintError, uniqueConstraintTarget } from '../lib/prisma-errors.js';
import { LOW_STOCK_THRESHOLD } from '../lib/constants.js';

export const productsRoute = new Hono<{ Variables: AppVariables }>();

const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().trim().optional(),
});

function totalStock(variants: { stock: number }[]): number {
  return variants.reduce((sum, v) => sum + v.stock, 0);
}

productsRoute.get('/', requireAuth, requireSeller, zValidator('query', paginationSchema), async (c) => {
  const store = c.get('store');
  const { page, pageSize, search } = c.req.valid('query');

  const where = {
    storeId: store.id,
    deletedAt: null,
    ...(search
      ? { title: { contains: search, mode: 'insensitive' as const } }
      : {}),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 }, variants: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  const enriched = products.map((p) => ({
    ...p,
    totalStock: totalStock(p.variants),
    isLowStock: p.variants.some((v) => v.stock <= LOW_STOCK_THRESHOLD),
  }));

  return c.json({ products: enriched, total, page, pageSize, lowStockThreshold: LOW_STOCK_THRESHOLD });
});

productsRoute.post('/', requireAuth, requireSeller, zValidator('json', createProductSchema), async (c) => {
  const store = c.get('store');
  const { images, variants, ...rest } = c.req.valid('json');

  try {
    const product = await prisma.product.create({
      data: {
        ...rest,
        storeId: store.id,
        status: 'DRAFT',
        images: { create: images },
        variants: { create: variants },
      },
      include: { images: true, variants: true },
    });
    return c.json(product, 201);
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      const target = uniqueConstraintTarget(err);
      throw new HTTPException(409, { message: `Duplicate value for: ${target ?? 'a unique field'}.` });
    }
    throw err;
  }
});

async function loadOwnedProduct(productId: string, storeId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { images: true, variants: true },
  });
  if (!product || product.storeId !== storeId || product.deletedAt) {
    throw new HTTPException(404, { message: 'Product not found.' });
  }
  return product;
}

productsRoute.get('/:id', requireAuth, requireSeller, async (c) => {
  const product = await loadOwnedProduct(c.req.param('id'), c.get('store').id);
  return c.json(product);
});

productsRoute.patch('/:id', requireAuth, requireSeller, zValidator('json', updateProductSchema), async (c) => {
  const store = c.get('store');
  const productId = c.req.param('id');
  await loadOwnedProduct(productId, store.id);
  const { images, variants, ...rest } = c.req.valid('json');

  const updated = await prisma.$transaction(async (tx) => {
    if (images) {
      await tx.productImage.deleteMany({ where: { productId } });
      await tx.productImage.createMany({
        data: images.map((img) => ({ ...img, productId })),
      });
    }

    if (variants) {
      const existingIds = variants.filter((v) => v.id).map((v) => v.id!);
      await tx.productVariant.deleteMany({
        where: { productId, id: { notIn: existingIds } },
      });
      for (const variant of variants) {
        const { id, ...data } = variant;
        if (id) {
          await tx.productVariant.update({ where: { id }, data });
        } else {
          await tx.productVariant.create({ data: { ...data, productId } });
        }
      }
    }

    return tx.product.update({
      where: { id: productId },
      data: rest,
      include: { images: { orderBy: { sortOrder: 'asc' } }, variants: true },
    });
  });

  return c.json(updated);
});

productsRoute.delete('/:id', requireAuth, requireSeller, async (c) => {
  const store = c.get('store');
  const productId = c.req.param('id');
  await loadOwnedProduct(productId, store.id);
  await prisma.product.update({
    where: { id: productId },
    data: { status: 'ARCHIVED', deletedAt: new Date() },
  });
  return c.body(null, 204);
});
