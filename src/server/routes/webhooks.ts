import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { verifyWebhook } from '@clerk/backend/webhooks';
import { prisma } from '../../db.js';

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
      const phone = u.phone_numbers?.[0]?.phone_number;
      if (!phone) break; // nothing we can key a User row on yet — requireAuth's lazy-create will retry once a phone exists
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
