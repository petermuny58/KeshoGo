import 'dotenv/config';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { HTTPException } from 'hono/http-exception';
import { clerkMiddleware } from '@clerk/hono';
import { ZodError } from 'zod';
import { sellerRoute } from './routes/seller.js';
import { categoriesRoute } from './routes/categories.js';
import { webhooksRoute } from './routes/webhooks.js';
import { publicCatalogRoute } from './routes/public-catalog.js';
import { cartRoute } from './routes/cart.js';
import { wishlistRoute } from './routes/wishlist.js';
import { buyerOrdersRoute } from './routes/buyer-orders.js';

const app = new Hono();

app.use('*', logger());
app.use(
  '*',
  cors({
    // Comma-separated in the env var so prod + a preview deploy can both work
    // without editing code, e.g. "https://keshogo.com,https://keshogo-preview.vercel.app"
    origin: (process.env.ALLOWED_ORIGINS ?? 'http://localhost:5173').split(','),
    credentials: true,
  }),
);
app.use('*', clerkMiddleware());

app.get('/health', (c) => c.json({ ok: true }));

// Webhooks are intentionally mounted before/outside anything that assumes an
// authenticated Clerk session — Clerk calls this endpoint itself, signed
// with the webhook secret, not a user session token.
app.route('/webhooks', webhooksRoute);

app.route('/api/categories', categoriesRoute);
app.route('/api/seller', sellerRoute);
app.route('/api/cart', cartRoute);
app.route('/api/wishlist', wishlistRoute);
app.route('/api/orders', buyerOrdersRoute);
app.route('/api', publicCatalogRoute);

// One consistent error shape for the whole API, so the frontend never has
// to guess whether an error came from Zod, an HTTPException, or something
// unexpected — it's always { error: string }.
app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json({ error: err.message }, err.status);
  }
  if (err instanceof ZodError) {
    return c.json({ error: 'Invalid request.', details: err.flatten() }, 400);
  }
  console.error(err);
  return c.json({ error: 'Something went wrong.' }, 500);
});

if (!process.env.VERCEL) {
  const port = Number(process.env.PORT ?? 8787);
  serve({ fetch: app.fetch, port }, (info) => {
    console.log(`KeshoGo API listening on http://localhost:${info.port}`);
  });
}

export { app };
