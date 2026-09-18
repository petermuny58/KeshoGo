import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { HTTPException } from 'hono/http-exception';
import { prisma } from '../../db.js';
import { requireAuth, requireSeller, type AppVariables } from '../middleware/auth.js';
import { createStoreSchema, updateStoreSchema } from '../lib/schemas.js';
import { isUniqueConstraintError } from '../lib/prisma-errors.js';
import { resolveStoreStatusAfterProfileUpdate } from '../lib/store-status.js';

export const storesRoute = new Hono<{ Variables: AppVariables }>();

// Becoming a seller — deliberately requireAuth only, not requireSeller,
// since a Store not existing yet is exactly the case this endpoint handles.
storesRoute.post('/', requireAuth, zValidator('json', createStoreSchema), async (c) => {
  const user = c.get('user');
  const input = c.req.valid('json');

  const existing = await prisma.store.findUnique({ where: { ownerId: user.id } });
  if (existing) {
    throw new HTTPException(409, { message: 'This account already has a store.' });
  }

  const status = resolveStoreStatusAfterProfileUpdate({
    name: input.name,
    bannerUrl: input.bannerUrl,
    payoutPhone: input.payoutPhone,
    payoutMethod: input.payoutMethod,
    status: 'PENDING',
  });

  try {
    const store = await prisma.store.create({
      data: { ...input, ownerId: user.id, status },
    });
    return c.json(store, 201);
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      throw new HTTPException(409, { message: 'That store URL is already taken.' });
    }
    throw err;
  }
});

storesRoute.get('/me', requireAuth, requireSeller, async (c) => {
  return c.json(c.get('store'));
});

storesRoute.patch('/me', requireAuth, requireSeller, zValidator('json', updateStoreSchema), async (c) => {
  const store = c.get('store');
  const input = c.req.valid('json');
  const updated = await prisma.store.update({ where: { id: store.id }, data: input });
  return c.json(updated);
});
