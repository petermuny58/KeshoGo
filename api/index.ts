import { getRequestListener } from '@hono/node-server';
import { app } from '../src/server/index.js';

export default getRequestListener(app.fetch);
