import 'dotenv/config';
import pg from 'pg';
import { execSync } from 'node:child_process';

async function wakeDb(retries = 5): Promise<void> {
  for (let i = 1; i <= retries; i++) {
    const client = new pg.Client({ connectionString: process.env.DIRECT_URL });
    try {
      await client.connect();
      await client.query('SELECT 1');
      await client.end();
      console.log(`Database awake (attempt ${i})`);
      return;
    } catch (err) {
      console.log(`Wake attempt ${i}/${retries} failed, retrying…`);
      try {
        await client.end();
      } catch {
        // ignore
      }
      await new Promise((r) => setTimeout(r, 3000 * i));
    }
  }
  throw new Error('Could not reach Neon database after retries');
}

await wakeDb();
console.log('Running migrations…');
execSync('npx prisma migrate deploy', { stdio: 'inherit' });
console.log('Seeding…');
execSync('npx tsx prisma/seed.ts', { stdio: 'inherit' });
console.log('Done.');
