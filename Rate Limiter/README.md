# Rate limiter middleware (Pron.co challenge)

One client's sync job ate ~40% of our API capacity for three hours last week. Other customers started hitting timeouts. This repo is my fix: a middleware layer that rate-limits requests **before** they hit your route handlers.

It's a proof of concept — in-memory only, no Redis. Not production-ready, and I'll be upfront about what breaks.

Built with Node + Express, but the middleware pattern would work elsewhere.

---

## Run it

```bash
npm install
npm start
```

Server runs on `http://localhost:3000`.

Try a normal request:

```bash
curl -i -H "X-Org-Id: acme" -H "X-Org-Tier: standard" \
  http://localhost:3000/api/resources
```

Hit the write endpoint (stricter limits):

```bash
curl -i -X POST -H "X-Org-Id: acme" -H "X-Org-Tier: standard" \
  -H "Content-Type: application/json" \
  http://localhost:3000/api/sync/trigger -d '{}'
```

Simulate a burst (server needs to be running):

```bash
npm run demo
```

You should see something like `{ ok: 8, limited: 7 }` on writes — that matches the write burst cap in config.

### Headers (PoC only)

For the demo I'm using headers to stand in for real auth:

- `X-Org-Id` — which org/client (required)
- `X-Org-Tier` — `standard` or `premium`

In a real app you'd pull org + plan from a JWT or API key metadata, not trust the client to send these.

---

## What the challenge asked for vs what I built

| Requirement | What I did |
|-------------|------------|
| Per-client limits | Token bucket per org + tier. Standard = 100/min, premium = 500/min |
| Per-endpoint limits | Second bucket: reads (GET etc.) vs writes (POST/PUT/PATCH/DELETE). Writes are tighter |
| 429 + useful error | Returns 429, `Retry-After` header, JSON says whether `per-client` or `per-endpoint` limit hit |
| Config without code changes | All limits in `config/rate-limits.json` |
| Middleware, not per-route | One line in `server.js`: `app.use(createRateLimitMiddleware())` |
| In-memory only | Plain `Map` in process memory |
| Handle bursts | Token bucket with `burstCapacity` — allows short spikes, blocks sustained abuse |

---

## How it works

```
Request comes in
       ↓
Middleware figures out: which org? which tier? read or write?
       ↓
Check org token bucket  ──→ 429 if empty (per-client limit)
       ↓
Check endpoint bucket   ──→ 429 if empty (per-endpoint limit)
       ↓
Both passed → route handler runs (unchanged)
```

Every request goes through **two** buckets. Both have to have tokens available.

Why two? Org limit stops one customer from hogging the whole API. Endpoint limit stops them from hammering expensive write paths even if they still have "general" quota left. A sync job posting constantly should hit the write cap first.

Small detail: if the endpoint bucket blocks a request, I refund the org token. Otherwise a rejected write would still burn org quota for no reason.

---

## Why token bucket (and not fixed window)

I started with a fixed-window counter in my head — count requests, reset every 60 seconds. Simple. But it doesn't fit the actual problem.

The incident was a **sync job** — bursty traffic, not a nice even 1.6 req/sec. Fixed window gives you bad choices:

- Strict window, no burst allowance → legitimate sync spikes get rejected immediately
- Loose window → client dumps 100 requests in second 1 of the minute, then goes quiet. Still hogs the API.

Token bucket is a better fit here. Tokens refill steadily (`requestsPerMinute / 60` per second), but `burstCapacity` caps how many you can fire back-to-back. So a sync job gets a short spike, not a free pass for three hours.

I considered sliding window (more accurate averages) and leaky bucket (smooths output) but token bucket was the right balance of burst handling vs implementation time for a 30-min PoC.

---

## Config

Everything lives in `config/rate-limits.json`. Change numbers there, restart the server. No route edits.

```json
{
  "defaultTier": "standard",
  "tiers": {
    "standard": { "requestsPerMinute": 100, "burstCapacity": 25 },
    "premium":    { "requestsPerMinute": 500, "burstCapacity": 100 }
  },
  "endpoints": {
    "read":  { "methods": ["GET","HEAD","OPTIONS"], "requestsPerMinute": 80, "burstCapacity": 20 },
    "write": { "methods": ["POST","PUT","PATCH","DELETE"], "requestsPerMinute": 30, "burstCapacity": 8 }
  }
}
```

- `requestsPerMinute` — how fast the bucket refills over time
- `burstCapacity` — max tokens stored; how big a short spike can be

---

## What a 429 looks like

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 2

{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded for per-endpoint.",
  "limit": {
    "type": "per-endpoint",
    "endpointClass": "write",
    "requestsPerMinute": 30,
    "burstCapacity": 8,
    "remaining": 0
  },
  "retryAfterSeconds": 2
}
```

On success you'll also get `X-RateLimit-Remaining-Org` and `X-RateLimit-Remaining-Endpoint` headers so clients can back off before they hit the wall.

---

## What breaks and Why?

This is in-memory on purpose. That means real limitations — not bugs, just trade-offs I chose for the PoC.

**Restart wipes everything.** Deploy, crash, whatever — all counters go to zero. A client you just blocked can send traffic again immediately after restart.

**Multiple server instances don't share state.** Run 3 replicas and a client effectively gets ~3× the configured limit. Worse, one instance can be getting hammered while the others look fine on a dashboard.

**Memory can grow.** Each org gets map entries for org bucket + endpoint buckets. I added TTL cleanup for idle buckets (default 1 hour) but that's a band-aid, not a fix.

**Config changes need a restart.** Existing buckets keep their old settings until they expire from the map.

**Clock stuff.** Refill uses `Date.now()`. Fine on one Node process. Gets messy across machines without a shared store.

Don't ship this as-is. When you have infra, swap the store for Redis (or similar) behind the same interface and keep the middleware as-is.

Rough migration path:

1. **Now** — in-memory token bucket, this middleware
2. **Next** — Redis keys like `ratelimit:org:{id}` and `ratelimit:org:{id}:write`
3. **Later** — edge rate limiting (ALB, Cloudflare, Kong) for raw flood protection; app-level for business tiers
4. **Eventually** — metrics on 429 rate by org/tier so you see problems before customers complain

---

## Project structure

```
config/rate-limits.json       limits live here
src/
  tokenBucket.js              the algorithm
  rateLimitStore.js           in-memory Map + idle cleanup
  rateLimitMiddleware.js      Express middleware
  index.js                    exports
server.js                     demo API
scripts/demo-burst.js         fires rapid requests to show 429s
```

Hook it up with your own auth:

```javascript
import { createRateLimitMiddleware } from './src/index.js';

app.use(createRateLimitMiddleware({
  resolveOrgId: (req) => req.user?.orgId,
  resolveTier: (req) => req.user?.plan,
}));
```

---

## Note on using AI for this

The main redirect: first draft was a fixed-window counter. Looked fine for "100 req/min" but wrong for bursty sync traffic. I switched to token bucket + separate read/write buckets instead. AI also wanted to add Redis early; I kept it in-memory because that's the constraint, and being honest about failure modes is part of the point.

---

## Trade-offs (short version)

- **In-memory** — fast, simple, wrong for multi-instance prod
- **Token bucket** — handles bursts, bit more code than fixed window
- **App middleware** — good for per-org business rules, not a replacement for edge DDoS protection
- **Header-based org ID** — fine for a demo, not for production trust boundaries

---

MIT — challenge submission.
