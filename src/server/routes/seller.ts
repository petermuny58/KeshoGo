import { Hono } from 'hono';
import { storesRoute } from './stores.js';
import { productsRoute } from './products.js';
import { ordersRoute } from './orders.js';
import { uploadsRoute } from './uploads.js';
import { overviewRoute } from './overview.js';
import { earningsRoute } from './earnings.js';
import { analyticsRoute } from './analytics.js';
import { profileRoute } from './profile.js';
import { reviewsRoute } from './reviews.js';
import type { AppVariables } from '../middleware/auth.js';

/** All seller-facing routes live under `/api/seller/*` behind requireSeller. */
export const sellerRoute = new Hono<{ Variables: AppVariables }>();

sellerRoute.route('/stores', storesRoute);
sellerRoute.route('/products', productsRoute);
sellerRoute.route('/orders', ordersRoute);
sellerRoute.route('/uploads', uploadsRoute);
sellerRoute.route('/overview', overviewRoute);
sellerRoute.route('/earnings', earningsRoute);
sellerRoute.route('/analytics', analyticsRoute);
sellerRoute.route('/profile', profileRoute);
sellerRoute.route('/reviews', reviewsRoute);
