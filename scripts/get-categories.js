import http from 'http';

const url = 'http://localhost:8787/api/categories';
const req = http.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => (data += chunk));
  res.on('end', () => {
    console.log('STATUS', res.statusCode);
    console.log('BODY', data);
  });
});
req.on('error', (err) => {
  console.error('ERROR', err.message);
});
