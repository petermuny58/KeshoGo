import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { HTTPException } from 'hono/http-exception';
import { z } from 'zod';
import { prisma } from '../../db.js';
import { requireAuth, requireSeller, type AppVariables } from '../middleware/auth.js';
import { updateFulfillmentSchema } from '../lib/schemas.js';
import { assertFulfillmentTransition } from '../lib/fulfillment.js';
import { COMMISSION_BPS } from '../lib/constants.js';

export const ordersRoute = new Hono<{ Variables: AppVariables }>();

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  status: z
    .enum(['new', 'processing', 'shipped', 'delivered', 'cancelled', 'all'])
    .default('all'),
});

const fulfillmentByStatus: Record<string, string | undefined> = {
  new: 'PENDING',
  processing: 'PENDING',
  shipped: 'SHIPPED',
  delivered: 'DELIVERED',
  cancelled: 'CANCELLED',
  all: undefined,
};

const orderSelect = {
  id: true,
  placedAt: true,
  orderStatus: true,
  paymentStatus: true,
  shippingFullName: true,
  shippingPhone: true,
  shippingAddressLine: true,
  shippingTown: true,
  buyerId: true,
} as const;

ordersRoute.get('/', requireAuth, requireSeller, zValidator('query', listQuerySchema), async (c) => {
  const store = c.get('store');
  const { page, pageSize, status } = c.req.valid('query');
  const fulfillmentStatus = fulfillmentByStatus[status];

  const where = {
    storeId: store.id,
    ...(fulfillmentStatus ? { fulfillmentStatus: fulfillmentStatus as 'PENDING' } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.orderItem.findMany({
      where,
      include: { order: { select: orderSelect } },
      orderBy: { order: { placedAt: 'desc' } },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.orderItem.count({ where }),
  ]);

  return c.json({ items, total, page, pageSize });
});

ordersRoute.get('/:orderId', requireAuth, requireSeller, async (c) => {
  const store = c.get('store');
  const orderId = c.req.param('orderId');

  const items = await prisma.orderItem.findMany({
    where: { orderId, storeId: store.id },
    include: { order: { select: orderSelect } },
  });
  if (items.length === 0) {
    throw new HTTPException(404, { message: 'Order not found.' });
  }

  const order = items[0].order;
  const sellerSubtotalNgwee = items.reduce((sum, i) => sum + i.lineTotalNgwee, 0);

  return c.json({ order, items, sellerSubtotalNgwee });
});

async function recordLedgerForDelivery(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  storeId: string,
  item: { id: string; lineTotalNgwee: number; titleSnapshot: string },
) {
  const commission = Math.floor((item.lineTotalNgwee * COMMISSION_BPS) / 10_000);
  await tx.sellerLedgerEntry.createMany({
    data: [
      {
        storeId,
        orderItemId: item.id,
        type: 'SALE',
        amountNgwee: item.lineTotalNgwee,
        description: `Sale: ${item.titleSnapshot}`,
      },
      {
        storeId,
        orderItemId: item.id,
        type: 'COMMISSION',
        amountNgwee: -commission,
        description: `Commission on: ${item.titleSnapshot}`,
      },
    ],
  });
}

ordersRoute.patch(
  '/:orderId/status',
  requireAuth,
  requireSeller,
  zValidator('json', updateFulfillmentSchema),
  async (c) => {
    const store = c.get('store');
    const orderId = c.req.param('orderId');
    const { fulfillmentStatus: nextStatus } = c.req.valid('json');

    const items = await prisma.orderItem.findMany({
      where: { orderId, storeId: store.id },
    });
    if (items.length === 0) {
      throw new HTTPException(404, { message: 'Order not found.' });
    }

    for (const item of items) {
      assertFulfillmentTransition(item.fulfillmentStatus, nextStatus);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const results = [];
      for (const item of items) {
        const row = await tx.orderItem.update({
          where: { id: item.id },
          data: { fulfillmentStatus: nextStatus },
        });
        if (nextStatus === 'DELIVERED' && item.fulfillmentStatus !== 'DELIVERED') {
          const existing = await tx.sellerLedgerEntry.count({
            where: { orderItemId: item.id, type: 'SALE' },
          });
          if (existing === 0) {
            await recordLedgerForDelivery(tx, store.id, item);
          }
        }
        results.push(row);
      }
      return results;
    });

    return c.json({ items: updated });
  },
);

ordersRoute.patch(
  '/items/:itemId/fulfillment',
  requireAuth,
  requireSeller,
  zValidator('json', updateFulfillmentSchema),
  async (c) => {
    const store = c.get('store');
    const itemId = c.req.param('itemId');
    const { fulfillmentStatus: nextStatus } = c.req.valid('json');

    const item = await prisma.orderItem.findUnique({ where: { id: itemId } });
    if (!item || item.storeId !== store.id) {
      throw new HTTPException(404, { message: 'Order item not found.' });
    }

    assertFulfillmentTransition(item.fulfillmentStatus, nextStatus);

    const updated = await prisma.orderItem.update({
      where: { id: itemId },
      data: { fulfillmentStatus: nextStatus },
    });

    if (nextStatus === 'DELIVERED' && item.fulfillmentStatus !== 'DELIVERED') {
      const existing = await prisma.sellerLedgerEntry.count({
        where: { orderItemId: item.id, type: 'SALE' },
      });
      if (existing === 0) {
        await prisma.$transaction(async (tx) => {
          await recordLedgerForDelivery(tx, store.id, item);
        });
      }
    }

    return c.json(updated);
  },
);
