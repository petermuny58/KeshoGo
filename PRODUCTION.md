# KeshoGo production checklist

Use this before pointing a public domain at the app.

## 1. Environment

Copy `.env.example` → `.env` (API host) and set Vite vars for the frontend build.

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` / `DIRECT_URL` | yes | Neon pooled + direct |
| `CLERK_SECRET_KEY` / `VITE_CLERK_PUBLISHABLE_KEY` | yes | Use **live** keys for real users |
| `CLERK_WEBHOOK_SIGNING_SECRET` | yes | Clerk → `POST /webhooks/clerk` |
| `ALLOWED_ORIGINS` | yes | Exact frontend origin(s), comma-separated |
| `R2_*` | yes for images | Banners + product photos |
| `CF_ACCOUNT_ID` / `CF_STREAM_*` | yes for reels | Cloudflare Stream |
| `VITE_API_BASE_URL` | prod only | Absolute API origin if frontend ≠ API host (no trailing slash) |
| `VITE_USE_MOCK_SELLER_API` | **must be unset** | Never `1` in production |
| `NODE_ENV` | `production` on API | Disables `x-dev-clerk-id` |
| `PAYMENTS_SIMULATE` | staging only | Auto-marks new orders PAID (never in real money mode) |
| `PAYMENTS_WEBHOOK_SECRET` | for live MoMo/Airtel | Shared secret for `/webhooks/payments/*` |
| `PAYOUTS_ENABLED` | leave `false` until disbursement is live | Seller payouts |

Run:

```bash
npm run check:prod-env
npx prisma migrate deploy
npm run db:seed   # optional categories/demo data
```

## 2. Deploy topology

KeshoGo is a **Vite SPA + separate Hono API** (`src/server/index.ts`).

**Recommended**
1. API on Railway / Fly / Render — `npm run api:start` (build server to `dist/` first) or `tsx src/server/index.ts`
2. Frontend on Vercel — set `VITE_API_BASE_URL=https://api.yourdomain.com` at build time
3. Clerk webhook URL: `https://api.yourdomain.com/webhooks/clerk`
4. CORS: `ALLOWED_ORIGINS=https://www.yourdomain.com`

**Same-origin alternative**
Put nginx/Caddy in front: `/api` and `/webhooks` → API `:8787`, everything else → SPA. Then leave `VITE_API_BASE_URL` empty.

Locally, Vite already proxies `/api` (see `vite.config.ts`). Proxy `/webhooks` the same way if testing Clerk locally via a tunnel.

## 3. Smoke test

1. Sign up (Clerk) → User row appears (webhook or lazy create)
2. Create store → Settings: banner + payout → status **ACTIVE**
3. Add product (R2 image) → publish ACTIVE
4. Upload reel (Stream)
5. Search finds store + product; Home / category / PDP show live catalog
6. Add to cart (signed in) → checkout creates PENDING (or PAID if `PAYMENTS_SIMULATE=true`)

## 4. Do not enable yet

- Live seller disbursements (`PAYOUTS_ENABLED=true`) until MoMo/Airtel payouts are contracted
- Real card acquiring without a PCI provider
