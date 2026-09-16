import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { HTTPException } from 'hono/http-exception';
import { z } from 'zod';
import { prisma } from '../../db.js';
import { requireAuth, requireSeller, type AppVariables } from '../middleware/auth.js';
import { reviewReplySchema } from '../lib/schemas.js';

export const reviewsRoute = new Hono<{ Variables: AppVariables }>();

const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

reviewsRoute.get(
  '/',
  requireAuth,
  requireSeller,
  zValidator('query', paginationSchema),
  async (c) => {
    const store = c.get('store');
    const { page, pageSize } = c.req.valid('query');

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { product: { storeId: store.id } },
        include: {
          user: { select: { fullName: true, avatarUrl: true } },
          product: { select: { title: true, slug: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.review.count({ where: { product: { storeId: store.id } } }),
    ]);

    return c.json({ reviews, total, page, pageSize });
  },
);

reviewsRoute.post(
  '/:id/reply',
  requireAuth,
  requireSeller,
  zValidator('json', reviewReplySchema),
  async (c) => {
    const store = c.get('store');
    const reviewId = c.req.param('id');
    const { sellerReply } = c.req.valid('json');

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: { product: { select: { storeId: true } } },
    });
    if (!review || review.product.storeId !== store.id) {
      throw new HTTPException(404, { message: 'Review not found.' });
    }

    const updated = await prisma.review.update({
      where: { id: reviewId },
      data: { sellerReply, repliedAt: new Date() },
    });
    return c.json(updated);
  },
);
