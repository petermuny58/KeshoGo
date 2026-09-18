import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { HTTPException } from 'hono/http-exception';
import { prisma } from '../../db.js';
import { requireAuth, requireSeller, type AppVariables } from '../middleware/auth.js';
import { createReelSchema } from '../lib/schemas.js';
import { createDirectUpload, deleteStreamVideo, streamPlaybackUrls } from '../lib/stream.js';

export const sellerReelsRoute = new Hono<{ Variables: AppVariables }>();

sellerReelsRoute.post('/upload-url', requireAuth, requireSeller, async (c) => {
  const result = await createDirectUpload(60);
  return c.json(result);
});

sellerReelsRoute.get('/', requireAuth, requireSeller, async (c) => {
  const store = c.get('store');
  const reels = await prisma.reel.findMany({
    where: { storeId: store.id },
    orderBy: { createdAt: 'desc' },
  });
  return c.json({ reels });
});

sellerReelsRoute.post('/', requireAuth, requireSeller, zValidator('json', createReelSchema), async (c) => {
  const store = c.get('store');
  const input = c.req.valid('json');

  if (input.productId) {
    const product = await prisma.product.findFirst({
      where: { id: input.productId, storeId: store.id, deletedAt: null },
    });
    if (!product) {
      throw new HTTPException(400, { message: 'Product not found in your store.' });
    }
  }

  const urls = streamPlaybackUrls(input.streamUid);

  try {
    const reel = await prisma.reel.create({
      data: {
        storeId: store.id,
        streamUid: input.streamUid,
        videoUrl: urls.videoUrl,
        thumbnailUrl: input.thumbnailUrl ?? urls.thumbnailUrl,
        caption: input.caption,
        productId: input.productId,
      },
    });
    return c.json(reel, 201);
  } catch {
    throw new HTTPException(409, { message: 'A reel with this Stream UID already exists.' });
  }
});

sellerReelsRoute.delete('/:id', requireAuth, requireSeller, async (c) => {
  const store = c.get('store');
  const reel = await prisma.reel.findFirst({
    where: { id: c.req.param('id'), storeId: store.id },
  });
  if (!reel) throw new HTTPException(404, { message: 'Reel not found.' });

  await deleteStreamVideo(reel.streamUid);
  await prisma.reel.delete({ where: { id: reel.id } });
  return c.body(null, 204);
});
