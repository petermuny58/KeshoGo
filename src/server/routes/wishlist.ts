import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { HTTPException } from 'hono/http-exception';
import { prisma } from '../../db.js';
import { requireAuth, type AppVariables } from '../middleware/auth.js';

export const wishlistRoute = new Hono<{ Variables: AppVariables }>();

wishlistRoute.get('/', requireAuth, async (c) => {
  const user = c.get('user');
  const items = await prisma.wishlistItem.findMany({
    where: { userId: user.id },
    select: { productId: true },
    orderBy: { createdAt: 'desc' },
  });
  return c.json({ productIds: items.map((i) => i.productId) });
});

wishlistRoute.post(
  '/',
  requireAuth,
  zValidator('json', z.object({ productId: z.string().cuid() })),
  async (c) => {
    const user = c.get('user');
    const { productId } = c.req.valid('json');
    const product = await prisma.product.findFirst({
      where: { id: productId, status: 'ACTIVE', deletedAt: null },
    });
    if (!product) throw new HTTPException(404, { message: 'Product not found.' });

    await prisma.wishlistItem.upsert({
      where: { userId_productId: { userId: user.id, productId } },
      create: { userId: user.id, productId },
      update: {},
    });
    return c.json({ productId }, 201);
  },
);

wishlistRoute.delete('/:productId', requireAuth, async (c) => {
  const user = c.get('user');
  await prisma.wishlistItem.deleteMany({
    where: { userId: user.id, productId: c.req.param('productId') },
  });
  return c.body(null, 204);
});
