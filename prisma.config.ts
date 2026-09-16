import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

// Prisma 7+ config. Migrations and `prisma db seed` run against DIRECT_URL
// (Neon's unpooled connection) because PgBouncer's transaction-pooling mode
// breaks the prepared statements and long-running transactions that
// migrations and seed scripts need. The app itself never uses this file —
// it connects at runtime via the pooled DATABASE_URL through the Neon
// driver adapter instead. See src/db.ts.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: env('DIRECT_URL'),
  },
});
