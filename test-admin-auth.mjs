// Quick test script to verify admin login API behavior
// Run with: node test-admin-auth.mjs

const https = require('https');

const ADMIN_PASSWORD = 'Admin2026!'; // The password Enoch set in Vercel
const APP_URL = 'https://authentic-gadget.vercel.app';

function httpRequest(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        const cookies = res.headers['set-cookie'];
        resolve({ status: res.statusCode, data: JSON.parse(data || '{}'), cookies });
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function testLogin() {
  console.log('Testing admin login API...');

  // Test the API directly
  const res = await httpRequest({
    hostname: 'authentic-gadget.vercel.app',
    path: '/api/admin/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { password: ADMIN_PASSWORD });

  console.log('Status:', res.status);
  console.log('Response:', JSON.stringify(res.data));
  console.log('Cookies set:', res.cookies ? res.cookies.length : 0);
  if (res.cookies) {
    res.cookies.forEach(c => console.log(' -', c.split(';')[0]));
  }
}

testLogin().catch(console.error);