import { handle } from '@hono/node-server/vercel';
import { app } from '../src/server/index.js';

export default handle(app);
