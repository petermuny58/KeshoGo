#!/usr/bin/env node
/**
 * Fails if critical production env vars are missing or unsafe.
 * Usage: NODE_ENV=production node scripts/check-production-env.js
 * Or: npm run check:prod-env
 */
import 'dotenv/config';

const isProd = process.env.NODE_ENV === 'production' || process.argv.includes('--strict');

const required = [
  'DATABASE_URL',
  'DIRECT_URL',
  'CLERK_SECRET_KEY',
  'CLERK_WEBHOOK_SIGNING_SECRET',
  'ALLOWED_ORIGINS',
];

const warnings = [];
const errors = [];

for (const key of required) {
  if (!process.env[key]?.trim()) {
    errors.push(`Missing ${key}`);
  }
}

if (process.env.VITE_USE_MOCK_SELLER_API === '1') {
  errors.push('VITE_USE_MOCK_SELLER_API=1 must not be set for production builds');
}

if (process.env.ALLOWED_ORIGINS?.includes('localhost') && isProd) {
  warnings.push('ALLOWED_ORIGINS still includes localhost');
}

if (process.env.CLERK_SECRET_KEY?.startsWith('sk_test_') && isProd) {
  warnings.push('CLERK_SECRET_KEY looks like a test key — switch to live for real users');
}

if (!process.env.R2_BUCKET_NAME) {
  warnings.push('R2 not configured — image uploads will use placeholders');
}

if (!process.env.CF_STREAM_API_TOKEN) {
  warnings.push('Cloudflare Stream not configured — reel uploads are stubbed');
}

if (process.env.PAYMENTS_SIMULATE === 'true' && isProd) {
  warnings.push('PAYMENTS_SIMULATE=true — orders auto-mark PAID (ok for staging only)');
}

if (process.env.PAYOUTS_ENABLED === 'true') {
  warnings.push('PAYOUTS_ENABLED=true — confirm MoMo/Airtel payout credentials first');
}

for (const w of warnings) console.warn(`WARN: ${w}`);
for (const e of errors) console.error(`ERROR: ${e}`);

if (errors.length) {
  console.error('\nProduction env check failed.');
  process.exit(1);
}

console.log('Production env check passed' + (warnings.length ? ` (${warnings.length} warning(s))` : ''));
