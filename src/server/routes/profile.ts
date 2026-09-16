import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { prisma } from '../../db.js';
import { requireAuth, requireSeller, type AppVariables } from '../middleware/auth.js';
import { updateStoreProfileSchema } from '../lib/schemas.js';

export const profileRoute = new Hono<{ Variables: AppVariables }>();

profileRoute.get('/', requireAuth, requireSeller, async (c) => {
  return c.json(c.get('store'));
});

profileRoute.patch(
  '/',
  requireAuth,
  requireSeller,
  zValidator('json', updateStoreProfileSchema),
  async (c) => {
    const store = c.get('store');
    const input = c.req.valid('json');
    const updated = await prisma.store.update({ where: { id: store.id }, data: input });
    return c.json(updated);
  },
);
