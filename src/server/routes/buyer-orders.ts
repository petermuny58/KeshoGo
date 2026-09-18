import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { HTTPException } from 'hono/http-exception';
import { prisma } from '../../db.js';
import { requireAuth, type AppVariables } from '../middleware/auth.js';
import { COMMISSION_BPS } from '../lib/constants.js';

export const buyerOrdersRoute = new Hono<{ Variables: AppVariables }>();

/** Free delivery above K500; otherwise K45. */
const FREE_DELIVERY_ABOVE_NGWEE = 50_000;
const DELIVERY_FEE_NGWEE = 4_500;

const createOrderSchema = z.object({
  shippingFullName: z.string().trim().min(2).max(120),
  shippingPhone: z.string().trim().min(9).max(20),
  shippingAddressLine: z.string().trim().min(3).max(200),
  shippingTown: z.string().trim().min(2).max(80),
  paymentMethod: z.enum(['AIRTEL_MONEY', 'MTN_MOMO', 'CARD']),
  paymentPhone: z.string().trim().min(9).max(20).optional(),
});

export const PAYMENTS_SIMULATE = process.env.PAYMENTS_SIMULATE === 'true';

buyerOrdersRoute.post('/', requireAuth, zValidator('json', createOrderSchema), async (c) => {
  const user = c.get('user');
  const input = c.req.valid('json');

  if (input.paymentMethod !== 'CARD' && !input.paymentPhone) {
    throw new HTTPException(400, { message: 'Mobile Money number is required.' });
  }

  const cartItems = await prisma.cartItem.findMany({
    where: { userId: user.id },
    include: {
      product: true,
      variant: true,
    },
  });

  if (cartItems.length === 0) {
    throw new HTTPException(400, { message: 'Your cart is empty.' });
  }

  for (const item of cartItems) {
    if (item.product.status !== 'ACTIVE' || item.product.deletedAt) {
      throw new HTTPException(400, { message: `Product unavailable: ${item.product.title}` });
    }
    const stock = item.variant?.stock ?? 0;
    if (stock < item.quantity) {
      throw new HTTPException(400, { message: `Insufficient stock for ${item.product.title}` });
    }
  }

  const lineRows = cartItems.map((item) => {
    const unit = item.variant?.priceNgweeOverride ?? item.product.priceNgwee;
    return {
      storeId: item.product.storeId,
      productId: item.product.id,
      variantId: item.variantId,
      titleSnapshot: item.product.title,
      unitPriceNgwee: unit,
      quantity: item.quantity,
      lineTotalNgwee: unit * item.quantity,
    };
  });

  const subtotalNgwee = lineRows.reduce((s, l) => s + l.lineTotalNgwee, 0);
  const deliveryFeeNgwee = subtotalNgwee >= FREE_DELIVERY_ABOVE_NGWEE ? 0 : DELIVERY_FEE_NGWEE;
  const totalNgwee = subtotalNgwee + deliveryFeeNgwee;

  const simulatePaid = PAYMENTS_SIMULATE;

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        buyerId: user.id,
        shippingFullName: input.shippingFullName,
        shippingPhone: input.shippingPhone,
        shippingAddressLine: input.shippingAddressLine,
        shippingTown: input.shippingTown,
        subtotalNgwee,
        deliveryFeeNgwee,
        discountNgwee: 0,
        totalNgwee,
        paymentMethod: input.paymentMethod,
        paymentStatus: simulatePaid ? 'PAID' : 'PENDING',
        paymentReference: simulatePaid ? `sim_${Date.now()}` : null,
        orderStatus: simulatePaid ? 'PROCESSING' : 'PENDING',
        items: { create: lineRows },
      },
      include: { items: true },
    });

    for (const item of cartItems) {
      if (item.variantId) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
      }
    }

    if (simulatePaid) {
      for (const oi of created.items) {
        const commission = Math.round((oi.lineTotalNgwee * COMMISSION_BPS) / 10_000);
        await tx.sellerLedgerEntry.createMany({
          data: [
            {
              storeId: oi.storeId,
              orderItemId: oi.id,
              type: 'SALE',
              amountNgwee: oi.lineTotalNgwee,
              description: `Sale: ${oi.titleSnapshot}`,
            },
            {
              storeId: oi.storeId,
              orderItemId: oi.id,
              type: 'COMMISSION',
              amountNgwee: -commission,
              description: `Platform commission (${COMMISSION_BPS / 100}%)`,
            },
          ],
        });
      }
    }

    await tx.cartItem.deleteMany({ where: { userId: user.id } });
    return created;
  });

  return c.json(
    {
      order: {
        id: order.id,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        totalNgwee: order.totalNgwee,
        subtotalNgwee: order.subtotalNgwee,
        deliveryFeeNgwee: order.deliveryFeeNgwee,
        simulated: simulatePaid,
      },
    },
    201,
  );
});

buyerOrdersRoute.get('/me', requireAuth, async (c) => {
  const user = c.get('user');
  const orders = await prisma.order.findMany({
    where: { buyerId: user.id },
    orderBy: { placedAt: 'desc' },
    take: 30,
    include: { items: { select: { titleSnapshot: true, quantity: true, lineTotalNgwee: true } } },
  });
  return c.json({ orders });
});
