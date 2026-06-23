# Code Artifact Guide

## Overview

This project is a proof-of-concept rate limiting layer built with Node.js and Express.

The goal is to protect API endpoints from a single client consuming a disproportionate amount of system capacity, similar to the scenario described in the challenge prompt where an automated sync job degraded performance for other customers.

The implementation uses:

- Express middleware
- Token bucket rate limiting
- Config-driven limits
- Per-client (organization) limits
- Per-endpoint (read vs write) limits
- In-memory storage

This implementation is intentionally in-memory to satisfy the challenge requirements. Notes on production scaling and Redis migration are included in the README.

---

## Project Structure

```text
Rate Limiter/
├── config/
│   └── rate-limits.json
├── scripts/
│   └── demo-burst.js
├── src/
│   ├── index.js
│   ├── rateLimitMiddleware.js
│   ├── rateLimitStore.js
│   └── tokenBucket.js
├── server.js
├── package.json
├── README.md
└── CodeArtifact.md
```

---

## Requirements

- Node.js 18+ recommended
- npm

Verify installation:

```bash
node -v
npm -v
```

---

## Installation

From the project root:

```bash
npm install
```

---

## Running the Application

Start the Express server:

```bash
npm start
```

Expected output:

```text
Server listening on port 3000
```

The API will now be available at:

```text
http://localhost:3000
```

---

## Running the Demo

A demonstration script is included to simulate burst traffic.

In a separate terminal:

```bash
npm run demo
```

The script rapidly sends requests against the API and demonstrates:

- Successful requests while tokens are available
- Rate limit enforcement
- HTTP 429 responses
- Interaction between endpoint limits and organization limits

This is the quickest way to validate the implementation.

---

## Manual Testing

### Trigger a Write Endpoint

```bash
curl -i -X POST \
  -H "X-Org-Id: demo-org" \
  -H "X-Org-Tier: standard" \
  -H "Content-Type: application/json" \
  http://localhost:3000/api/sync/trigger \
  -d '{}'
```

Expected behavior:

- Initial requests succeed
- Subsequent requests exceed the write bucket
- API returns HTTP 429

---

### Generate Burst Traffic

```bash
for i in $(seq 1 10); do
  curl -s -o /dev/null -w "Request $i: %{http_code}\n" \
    -X POST \
    -H "X-Org-Id: demo-org" \
    -H "X-Org-Tier: standard" \
    -H "Content-Type: application/json" \
    http://localhost:3000/api/sync/trigger \
    -d '{}'
done
```

Expected output:

```text
Request 1: 202
Request 2: 202
...
Request 8: 202
Request 9: 429
Request 10: 429
```

(The exact transition point depends on the configured burst capacity.)

---

## Configuration

All limits are defined in:

```text
config/rate-limits.json
```

The configuration supports:

### Organization-Level Limits

These protect the overall system from a single customer consuming excessive capacity.

Example:

```json
{
  "standard": {
    "requestsPerMinute": 100,
    "burstCapacity": 25
  }
}
```

### Endpoint-Level Limits

These differentiate between cheaper read operations and more expensive write operations.

Example:

```json
{
  "write": {
    "requestsPerMinute": 30,
    "burstCapacity": 8
  }
}
```

No route code changes are required when adjusting limits.

---

## Architecture

### Middleware Layer

The rate limiter is implemented as Express middleware.

```javascript
app.use(createRateLimitMiddleware());
```

This ensures:

- Every request is evaluated before reaching business logic
- No duplication across route handlers
- Centralized rate limiting behavior

---

### Dual-Bucket Evaluation

Each request must pass two independent checks:

1. Organization bucket
2. Endpoint bucket

Both must have available tokens.

If either bucket rejects the request:

- HTTP 429 is returned
- A Retry-After header is included
- The response indicates which limit triggered the rejection

---

### Token Bucket Algorithm

The implementation uses a token bucket strategy because the challenge scenario involves bursty traffic patterns.

Benefits:

- Allows short bursts
- Prevents sustained abuse
- Models real API traffic more naturally than fixed-window counters

Each bucket:

- Refills continuously
- Has a maximum burst capacity
- Computes retry timing when exhausted

---

## Known Limitations

This implementation intentionally uses in-memory storage.

As a result:

### Process Restart

Restarting the server resets all counters.

### Multi-Instance Deployment

Multiple API servers will not share rate limit state.

### Memory Growth

Additional organizations create additional buckets.

A cleanup mechanism removes idle buckets, but a centralized store would be preferable in production.

---

## Production Migration Path

The design intentionally separates:

- Middleware
- Bucket logic
- Storage

A Redis-backed implementation could replace the in-memory store while preserving the middleware interface and endpoint behavior.

This allows the proof-of-concept to evolve into a production-ready solution without major architectural changes.

---

## Files Worth Reviewing

### server.js

Application entry point and middleware registration.

### config/rate-limits.json

All configurable rate limit definitions.

### src/rateLimitMiddleware.js

Request evaluation and HTTP 429 handling.

### src/tokenBucket.js

Core token bucket implementation and refill logic.

### README.md

Challenge mapping, design decisions, trade-offs, and production considerations.

---

## Video Walkthrough

A companion walkthrough video demonstrates:

- Design rationale
- AI-assisted development decisions
- Token bucket trade-offs
- Burst traffic simulation
- HTTP 429 behavior
- Code review of key implementation files

For the fastest evaluation path:

1. Run `npm start`
2. Run `npm run demo`
3. Review `src/rateLimitMiddleware.js`
4. Review `src/tokenBucket.js`
5. Read the README