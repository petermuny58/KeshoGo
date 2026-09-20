import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';
import { getAuth } from '@clerk/hono';
import { prisma } from '../../db.js';
import type { User, Store } from '../../generated/prisma/index.js';

export type AppVariables = {
  user: User;
  store: Store;
};

/**
 * Confirms the request carries a valid Clerk session, then loads (or, on a
 * first-request race against the `user.created` webhook, lazily creates)
 * the matching Postgres User row. Everything downstream reads `c.get('user')`
 * rather than touching Clerk directly — the DB row is the source of truth
 * for app data, Clerk is only ever asked for identity.
 */
export const requireAuth = createMiddleware<{ Variables: AppVariables }>(async (c, next) => {
  // Development helper: allow a dev-only header to impersonate a Clerk user
  // so local testing doesn't require a full Clerk session. This is enabled
  // only when NODE_ENV=development and a `x-dev-clerk-id` header is present.
  const devClerkId = process.env.NODE_ENV === 'development' ? c.req.header('x-dev-clerk-id') : undefined;

  let userId: string | undefined;
  if (devClerkId) {
    userId = devClerkId;
  } else {
    const auth = getAuth(c);
    if (!auth?.userId) {
      throw new HTTPException(401, { message: 'Sign in required.' });
    }
    userId = auth.userId;
  }

  let user = await prisma.user.findUnique({ where: { clerkId: userId } });

  if (!user) {
    if (devClerkId) {
      // Create a minimal local dev user record without calling Clerk.
      user = await prisma.user.create({
        data: {
          clerkId: userId!,
          phone: `dev-${userId}`,
          email: null,
          fullName: 'Dev User',
        },
      });
    } else {
      // Webhook hasn't landed yet — pull identity from Clerk directly rather
      // than blocking a legitimately authenticated request on webhook timing.
      const clerkClient = c.get('clerk');
      const clerkUser = await clerkClient.users.getUser(userId!);
      const phone = clerkUser.phoneNumbers[0]?.phoneNumber || `no-phone-${userId}`;

      user = await prisma.user.upsert({
        where: { clerkId: userId! },
        update: {},
        create: {
          clerkId: userId!,
          phone,
          email: clerkUser.emailAddresses[0]?.emailAddress,
          fullName: `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim() || 'KeshoGo User',
          avatarUrl: clerkUser.imageUrl,
        },
      });
    }
  }

  c.set('user', user);
  await next();
});

/**
 * Chain after requireAuth on any seller-only route. There's no RLS backing
 * this (Postgres has no idea who "the current seller" is) — this middleware
 * plus the ownership checks in each route ARE the authorization layer.
 * Skipping this on a route is a real security bug, not a style nit.
 */
export const requireSeller = createMiddleware<{ Variables: AppVariables }>(async (c, next) => {
  const user = c.get('user');
  let store = await prisma.store.findUnique({ where: { ownerId: user.id } });
  // Development helper: auto-create a store for local dev when a dev clerk
  // header is present so the frontend can exercise seller flows without
  // going through the UI create-store step. Only active in development.
  const devClerkId = process.env.NODE_ENV === 'development' ? c.req.header('x-dev-clerk-id') : undefined;
  if (!store && devClerkId) {
    store = await prisma.store.create({
      data: { ownerId: user.id, name: 'Dev Store', slug: `dev-store-${user.id.slice(0,6)}`, status: 'ACTIVE' },
    });
  }
  if (!store) {
    throw new HTTPException(403, { message: 'No store found for this account. Create one first.' });
  }
  if (store.status === 'SUSPENDED') {
    throw new HTTPException(403, { message: 'This store is suspended.' });
  }
  c.set('store', store);
  await next();
});
