import { Hono } from 'hono';
import { prisma } from '../../db.js';

export const categoriesRoute = new Hono();

categoriesRoute.get('/', async (c) => {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
    select: { id: true, slug: true, name: true, icon: true },
  });
  return c.json({ categories });
});
