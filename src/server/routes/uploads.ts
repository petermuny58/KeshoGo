import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'node:crypto';
import { requireAuth, requireSeller, type AppVariables } from '../middleware/auth.js';

export const uploadsRoute = new Hono<{ Variables: AppVariables }>();

const presignSchema = z.object({
  filename: z.string().trim().min(1).max(200),
  contentType: z.string().trim().regex(/^image\//, 'only image uploads are allowed'),
  folder: z.enum(['products', 'store']).default('products'),
});

function r2Client() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!accountId || !accessKeyId || !secretAccessKey) return null;
  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

function publicUrlForKey(key: string): string {
  const base = process.env.R2_PUBLIC_BASE_URL;
  if (base) return `${base.replace(/\/$/, '')}/${key}`;
  return key;
}

uploadsRoute.post(
  '/presign',
  requireAuth,
  zValidator('json', presignSchema),
  async (c) => {
    const user = c.get('user');
    const { filename, contentType, folder } = c.req.valid('json');
    const ext = filename.includes('.') ? filename.slice(filename.lastIndexOf('.')) : '';
    const key = `${folder}/${user.id}/${randomUUID()}${ext}`;

    const client = r2Client();
    const bucket = process.env.R2_BUCKET_NAME;

    if (!client || !bucket) {
      // Dev fallback when R2 is not configured — client can still save the key/URL.
      return c.json({
        key,
        uploadUrl: null,
        publicUrl: `https://placeholder.example/${key}`,
        devMode: true,
      });
    }

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
    });
    const uploadUrl = await getSignedUrl(client, command, { expiresIn: 600 });

    return c.json({
      key,
      uploadUrl,
      publicUrl: publicUrlForKey(key),
      devMode: false,
    });
  },
);
