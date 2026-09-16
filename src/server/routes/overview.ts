import { Hono } from 'hono';
import { prisma } from '../../db.js';
import { requireAuth, requireSeller, type AppVariables } from '../middleware/auth.js';
import { LOW_STOCK_THRESHOLD } from '../lib/constants.js';

export const overviewRoute = new Hono<{ Variables: AppVariables }>();

overviewRoute.get('/', requireAuth, requireSeller, async (c) => {
  const store = c.get('store');
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [todaySales, pendingOrders, lowStockProducts] = await Promise.all([
    prisma.orderItem.aggregate({
      where: {
        storeId: store.id,
        order: { placedAt: { gte: startOfDay }, paymentStatus: 'PAID' },
      },
      _sum: { lineTotalNgwee: true },
    }),
    prisma.orderItem.count({
      where: { storeId: store.id, fulfillmentStatus: 'PENDING' },
    }),
    prisma.product.count({
      where: {
        storeId: store.id,
        deletedAt: null,
        status: 'ACTIVE',
        variants: { some: { stock: { lte: LOW_STOCK_THRESHOLD } } },
      },
    }),
  ]);

  return c.json({
    todaySalesNgwee: todaySales._sum.lineTotalNgwee ?? 0,
    pendingOrderCount: pendingOrders,
    lowStockProductCount: lowStockProducts,
    lowStockThreshold: LOW_STOCK_THRESHOLD,
  });
});
