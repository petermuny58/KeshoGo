import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { verifyWebhook } from '@clerk/backend/webhooks';
import { prisma } from '../../db.js';
import { COMMISSION_BPS } from '../lib/constants.js';

export const webhooksRoute = new Hono();

webhooksRoute.post('/clerk', async (c) => {
  let event;
  try {
    // Verifies the Svix signature against CLERK_WEBHOOK_SIGNING_SECRET —
    // do not skip this and trust the payload as-is, it's an unauthenticated
    // public endpoint by nature (Clerk calls it from the outside).
    event = await verifyWebhook(c.req.raw);
  } catch {
    throw new HTTPException(400, { message: 'Invalid webhook signature.' });
  }

  switch (event.type) {
    case 'user.created':
    case 'user.updated': {
      const u = event.data;
      const phone = u.phone_numbers?.[0]?.phone_number || `no-phone-${u.id}`;

      await prisma.user.upsert({
        where: { clerkId: u.id },
        update: {
          phone,
          email: u.email_addresses?.[0]?.email_address,
          fullName: `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim() || 'KeshoGo User',
          avatarUrl: u.image_url,
        },
        create: {
          clerkId: u.id,
          phone,
          email: u.email_addresses?.[0]?.email_address,
          fullName: `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim() || 'KeshoGo User',
          avatarUrl: u.image_url,
        },
      });
      break;
    }
    case 'user.deleted': {
      // Deliberately not deleting the row: Order.buyerId is onDelete:
      // Restrict specifically to protect order history, so a bare delete
      // here would throw. A real "delete my account" flow needs an
      // anonymization step (scrub PII, keep the row for order integrity),
      // not a table delete — out of scope until that flow is designed.
      break;
    }
    default:
      break;
  }

  return c.json({ received: true });
});

/** MoMo / Airtel payment confirmation callbacks. */
webhooksRoute.post('/payments/momo', async (c) => {
  return c.json(await applyPaymentWebhook(c));
});
webhooksRoute.post('/payments/airtel', async (c) => {
  return c.json(await applyPaymentWebhook(c));
});

async function applyPaymentWebhook(c: { req: { header: (n: string) => string | undefined; json: () => Promise<unknown> } }) {
  const secret = process.env.PAYMENTS_WEBHOOK_SECRET;
  if (!secret) {
    throw new HTTPException(503, { message: 'Payment webhooks are not configured.' });
  }
  if (c.req.header('X-Webhook-Secret') !== secret) {
    throw new HTTPException(401, { message: 'Invalid webhook secret.' });
  }

  const body = (await c.req.json()) as {
    orderId?: string;
    paymentReference?: string;
    status?: 'PAID' | 'FAILED';
  };

  if (!body.orderId || !body.status) {
    throw new HTTPException(400, { message: 'orderId and status are required.' });
  }

  const order = await prisma.order.findUnique({
    where: { id: body.orderId },
    include: { items: true },
  });
  if (!order) throw new HTTPException(404, { message: 'Order not found.' });

  if (body.status === 'FAILED') {
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus: 'FAILED', paymentReference: body.paymentReference ?? order.paymentReference },
    });
    return { received: true, paymentStatus: 'FAILED' as const };
  }

  if (order.paymentStatus === 'PAID') {
    return { received: true, paymentStatus: 'PAID' as const };
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'PAID',
        orderStatus: 'PROCESSING',
        paymentReference: body.paymentReference ?? order.paymentReference,
      },
    });

    for (const oi of order.items) {
      const existing = await tx.sellerLedgerEntry.findFirst({
        where: { orderItemId: oi.id, type: 'SALE' },
      });
      if (existing) continue;
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
  });

  return { received: true, paymentStatus: 'PAID' as const };
}
