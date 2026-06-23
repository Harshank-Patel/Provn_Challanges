/**
 * Sends a burst of requests to show token-bucket behavior vs fixed-window rejection.
 * Run: npm start (in one terminal), then npm run demo
 */
const BASE = process.env.API_URL || 'http://localhost:3000';
const ORG = 'burst-demo-org';

async function fire(method, path, count) {
  const results = { ok: 0, limited: 0, other: 0 };

  for (let i = 0; i < count; i++) {
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        'X-Org-Id': ORG,
        'X-Org-Tier': 'standard',
        'Content-Type': 'application/json',
      },
      body: method === 'POST' ? JSON.stringify({}) : undefined,
    });

    if (res.status === 200 || res.status === 202 || res.status === 204) results.ok++;
    else if (res.status === 429) results.limited++;
    else results.other++;
  }

  return results;
}

console.log('Burst test — write endpoint (POST /api/sync/trigger), 15 rapid requests');
console.log('Config burstCapacity for write = 8; expect ~8 ok then 429s\n');

const writeBurst = await fire('POST', '/api/sync/trigger', 15);
console.log('Write burst:', writeBurst);

console.log('\nRead burst — GET /api/resources, 30 rapid requests');
console.log('Config burstCapacity for read = 20\n');

const readBurst = await fire('GET', '/api/resources', 30);
console.log('Read burst:', readBurst);
