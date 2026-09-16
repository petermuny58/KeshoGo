import { PrismaClient } from '../src/generated/prisma/index.js';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';
import { neonConfig } from '@neondatabase/serverless';

// Neon's serverless driver talks HTTP/WebSocket instead of raw TCP, which is
// what lets it run on edge runtimes. Node.js doesn't have a native
// WebSocket global the driver can use, so it needs this polyfill wired in —
// harmless to leave in place if you later deploy to an edge runtime that
// *does* have native WebSocket (Vercel Edge, Cloudflare Workers), since
// this constructor is just never used there.
neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });

// Standard singleton pattern: without this, every hot-reload in dev (or
// every serverless cold start if done wrong) creates a fresh PrismaClient
// and a fresh connection pool, which exhausts Neon's pooled connection
// limit in minutes under real traffic.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma: PrismaClient = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
