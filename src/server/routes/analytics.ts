import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { prisma } from '../../db.js';
import { requireAuth, requireSeller, type AppVariables } from '../middleware/auth.js';

export const analyticsRoute = new Hono<{ Variables: AppVariables }>();

const rangeSchema = z.object({
  range: z.enum(['3m', '6m', '12m']).default('6m'),
});

function monthsBack(range: '3m' | '6m' | '12m'): number {
  return range === '3m' ? 3 : range === '6m' ? 6 : 12;
}

analyticsRoute.get('/', requireAuth, requireSeller, zValidator('query', rangeSchema), async (c) => {
  const store = c.get('store');
  const { range } = c.req.valid('query');
  const since = new Date();
  since.setMonth(since.getMonth() - monthsBack(range));

  const items = await prisma.orderItem.findMany({
    where: {
      storeId: store.id,
      order: { placedAt: { gte: since }, paymentStatus: 'PAID' },
    },
    select: {
      lineTotalNgwee: true,
      quantity: true,
      titleSnapshot: true,
      productId: true,
      order: { select: { buyerId: true, placedAt: true } },
    },
  });

  const monthlyProfit = new Map<string, number>();
  const monthlyBuyers = new Map<string, Set<string>>();
  const productSales = new Map<string, { title: string; units: number; revenueNgwee: number }>();

  for (const item of items) {
    const monthKey = item.order.placedAt.toISOString().slice(0, 7);
    monthlyProfit.set(monthKey, (monthlyProfit.get(monthKey) ?? 0) + item.lineTotalNgwee);

    if (!monthlyBuyers.has(monthKey)) monthlyBuyers.set(monthKey, new Set());
    monthlyBuyers.get(monthKey)!.add(item.order.buyerId);

    const key = item.productId ?? item.titleSnapshot;
    const existing = productSales.get(key) ?? {
      title: item.titleSnapshot,
      units: 0,
      revenueNgwee: 0,
    };
    existing.units += item.quantity;
    existing.revenueNgwee += item.lineTotalNgwee;
    productSales.set(key, existing);
  }

  const profitSeries = [...monthlyProfit.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, profitNgwee]) => ({ month, profitNgwee }));

  const buyerSeries = [...monthlyBuyers.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, buyers]) => ({ month, buyerCount: buyers.size }));

  const topProducts = [...productSales.values()]
    .sort((a, b) => b.revenueNgwee - a.revenueNgwee)
    .slice(0, 10);

  return c.json({ profitSeries, buyerSeries, topProducts, range });
});
