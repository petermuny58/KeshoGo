import http from 'http';
import { URL } from 'url';

function httpRequest(method, urlString, headers = {}, body = null) {
  const url = new URL(urlString);
  const opts = {
    method,
    hostname: url.hostname,
    port: url.port,
    path: url.pathname + url.search,
    headers,
  };
  return new Promise((resolve, reject) => {
    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        resolve({ status: res.statusCode, body: data });
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

(async () => {
  try {
    const base = 'http://localhost:8787';
    console.log('Fetching categories...');
    const cats = await httpRequest('GET', `${base}/api/categories`);
    console.log('Categories status', cats.status);
    const categories = JSON.parse(cats.body).categories;
    const categoryId = categories[0]?.id;
    if (!categoryId) throw new Error('No categories available');

    console.log('Creating store...');
    const storeBody = JSON.stringify({ name: 'Dev Store', slug: 'dev-store' });
    const storeRes = await httpRequest('POST', `${base}/api/seller/stores`, {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(storeBody),
      'x-dev-clerk-id': 'dev_user_1',
    }, storeBody);
    console.log('Store status', storeRes.status);
    console.log('Store body', storeRes.body);

    console.log('Creating product...');
    const productPayload = JSON.stringify({
      categoryId,
      slug: 'dev-product',
      title: 'Dev Product',
      description: 'Product created by local test script',
      priceNgwee: 15000,
      images: [{ url: 'https://example.com/dev.png', altText: 'dev', sortOrder: 0 }],
      variants: [{ sku: 'DEV-1', stock: 10 }],
    });
    const prodRes = await httpRequest('POST', `${base}/api/seller/products`, {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(productPayload),
      'x-dev-clerk-id': 'dev_user_1',
    }, productPayload);
    console.log('Product status', prodRes.status);
    console.log('Product body', prodRes.body);
  } catch (e) {
    console.error('ERROR', e.message || e);
  }
})();
