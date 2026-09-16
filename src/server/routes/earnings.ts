import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { prisma } from '../../db.js';
import { requireAuth, requireSeller, type AppVariables } from '../middleware/auth.js';
import { COMMISSION_BPS, PAYOUTS_ENABLED } from '../lib/constants.js';

export const earningsRoute = new Hono<{ Variables: AppVariables }>();

const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

earningsRoute.get('/', requireAuth, requireSeller, async (c) => {
  const store = c.get('store');

  const [sales, commissions, payouts] = await Promise.all([
    prisma.sellerLedgerEntry.aggregate({
      where: { storeId: store.id, type: 'SALE' },
      _sum: { amountNgwee: true },
    }),
    prisma.sellerLedgerEntry.aggregate({
      where: { storeId: store.id, type: 'COMMISSION' },
      _sum: { amountNgwee: true },
    }),
    prisma.sellerLedgerEntry.aggregate({
      where: { storeId: store.id, type: 'PAYOUT' },
      _sum: { amountNgwee: true },
    }),
  ]);

  const grossSalesNgwee = sales._sum.amountNgwee ?? 0;
  const commissionNgwee = Math.abs(commissions._sum.amountNgwee ?? 0);
  const paidOutNgwee = Math.abs(payouts._sum.amountNgwee ?? 0);
  const netBalanceNgwee = grossSalesNgwee - commissionNgwee - paidOutNgwee;

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const monthCommission = await prisma.sellerLedgerEntry.aggregate({
    where: {
      storeId: store.id,
      type: 'COMMISSION',
      createdAt: { gte: startOfMonth },
    },
    _sum: { amountNgwee: true },
  });

  return c.json({
    grossSalesNgwee,
    commissionNgwee,
    netBalanceNgwee,
    thisMonthCommissionNgwee: Math.abs(monthCommission._sum.amountNgwee ?? 0),
    commissionRateBps: COMMISSION_BPS,
    payoutsEnabled: PAYOUTS_ENABLED,
    payoutStatus: PAYOUTS_ENABLED ? 'PROCESSING' : 'ACCRUING',
  });
});

earningsRoute.get(
  '/history',
  requireAuth,
  requireSeller,
  zValidator('query', paginationSchema),
  async (c) => {
    const store = c.get('store');
    const { page, pageSize } = c.req.valid('query');

    const [entries, total] = await Promise.all([
      prisma.sellerLedgerEntry.findMany({
        where: { storeId: store.id },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          orderItem: {
            select: { titleSnapshot: true, orderId: true },
          },
        },
      }),
      prisma.sellerLedgerEntry.count({ where: { storeId: store.id } }),
    ]);

    return c.json({ entries, total, page, pageSize });
  },
);
