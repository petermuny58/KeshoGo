import { HTTPException } from 'hono/http-exception';
import { randomUUID } from 'node:crypto';

function streamConfig() {
  const accountId = process.env.CF_ACCOUNT_ID;
  const apiToken = process.env.CF_STREAM_API_TOKEN;
  const customerSubdomain = process.env.CF_STREAM_CUSTOMER_SUBDOMAIN;
  if (!accountId || !apiToken || !customerSubdomain) return null;
  return { accountId, apiToken, customerSubdomain: customerSubdomain.replace(/^https?:\/\//, '').replace(/\/$/, '') };
}

export function streamPlaybackUrls(uid: string) {
  const cfg = streamConfig();
  const host = cfg?.customerSubdomain ?? 'customer-placeholder.cloudflarestream.com';
  return {
    videoUrl: `https://${host}/${uid}/manifest/video.m3u8`,
    thumbnailUrl: `https://${host}/${uid}/thumbnails/thumbnail.jpg`,
    iframeUrl: `https://${host}/${uid}/iframe`,
  };
}

export async function createDirectUpload(maxDurationSeconds = 60): Promise<{
  uploadURL: string;
  uid: string;
  devMode: boolean;
}> {
  const cfg = streamConfig();
  if (!cfg) {
    const uid = `dev-${randomUUID()}`;
    return { uploadURL: '', uid, devMode: true };
  }

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${cfg.accountId}/stream/direct_upload`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cfg.apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        maxDurationSeconds,
        requireSignedURLs: false,
      }),
    },
  );

  const body = (await res.json()) as {
    success: boolean;
    errors?: { message: string }[];
    result?: { uploadURL: string; uid: string };
  };

  if (!res.ok || !body.success || !body.result) {
    const msg = body.errors?.[0]?.message ?? 'Cloudflare Stream upload URL failed';
    throw new HTTPException(502, { message: msg });
  }

  return { uploadURL: body.result.uploadURL, uid: body.result.uid, devMode: false };
}

export async function deleteStreamVideo(uid: string): Promise<void> {
  const cfg = streamConfig();
  if (!cfg || uid.startsWith('dev-')) return;

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${cfg.accountId}/stream/${uid}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${cfg.apiToken}` },
    },
  );

  if (!res.ok && res.status !== 404) {
    throw new HTTPException(502, { message: 'Failed to delete Stream video' });
  }
}
