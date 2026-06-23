import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { RateLimitStore } from './rateLimitStore.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_CONFIG_PATH = path.join(__dirname, '../config/rate-limits.json');

function loadConfig(configPath = DEFAULT_CONFIG_PATH) {
  const raw = fs.readFileSync(configPath, 'utf8');
  return JSON.parse(raw);
}

function resolveEndpointClass(method, endpointsConfig) {
  const upper = method.toUpperCase();
  for (const [name, cfg] of Object.entries(endpointsConfig)) {
    if (cfg.methods.map((m) => m.toUpperCase()).includes(upper)) {
      return name;
    }
  }
  return 'write';
}

function buildLimitPayload({ limitType, tier, endpointClass, result, configSlice }) {
  return {
    error: 'Too Many Requests',
    message: `Rate limit exceeded for ${limitType}.`,
    limit: {
      type: limitType,
      tier: tier ?? undefined,
      endpointClass: endpointClass ?? undefined,
      requestsPerMinute: configSlice.requestsPerMinute,
      burstCapacity: configSlice.burstCapacity,
      remaining: result.remaining,
    },
    retryAfterSeconds: result.retryAfterSec,
  };
}

/**
 * Express-compatible rate limiting middleware.
 *
 * Checks two independent token buckets per request:
 *   1. Per-org (tier from config)
 *   2. Per-endpoint class (read vs write)
 *
 * Both must allow the request. First failure wins for the 429 response.
 */
export function createRateLimitMiddleware(options = {}) {
  const config = options.config ?? loadConfig(options.configPath);
  const store = options.store ?? new RateLimitStore(config.store ?? {});

  const resolveOrgId =
    options.resolveOrgId ??
    ((req) => req.headers['x-org-id'] || req.headers['x-organization-id']);

  const resolveTier =
    options.resolveTier ??
    ((req) => req.headers['x-org-tier'] || config.defaultTier);

  return function rateLimitMiddleware(req, res, next) {
    const orgId = resolveOrgId(req);
    if (!orgId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Missing organization identifier (X-Org-Id header).',
      });
    }

    const tierName = String(resolveTier(req)).toLowerCase();
    const tierConfig = config.tiers[tierName] ?? config.tiers[config.defaultTier];
    const endpointClass = resolveEndpointClass(req.method, config.endpoints);
    const endpointConfig = config.endpoints[endpointClass];

    const orgKey = `org:${orgId}:tier:${tierName}`;
    const endpointKey = `org:${orgId}:endpoint:${endpointClass}`;

    const orgBucket = store.getOrCreateBucket(orgKey, {
      capacity: tierConfig.burstCapacity,
      requestsPerMinute: tierConfig.requestsPerMinute,
    });

    const endpointBucket = store.getOrCreateBucket(endpointKey, {
      capacity: endpointConfig.burstCapacity,
      requestsPerMinute: endpointConfig.requestsPerMinute,
    });

    const orgResult = orgBucket.tryConsume();
    if (!orgResult.allowed) {
      res.set('Retry-After', String(orgResult.retryAfterSec));
      return res.status(429).json(
        buildLimitPayload({
          limitType: 'per-client',
          tier: tierName,
          result: orgResult,
          configSlice: tierConfig,
        })
      );
    }

    const endpointResult = endpointBucket.tryConsume();
    if (!endpointResult.allowed) {
      // Refund org token — endpoint limit is the binding constraint for this attempt.
      orgBucket.tokens = Math.min(orgBucket.capacity, orgBucket.tokens + 1);

      res.set('Retry-After', String(endpointResult.retryAfterSec));
      return res.status(429).json(
        buildLimitPayload({
          limitType: 'per-endpoint',
          endpointClass,
          result: endpointResult,
          configSlice: endpointConfig,
        })
      );
    }

    res.set('X-RateLimit-Remaining-Org', String(orgResult.remaining));
    res.set('X-RateLimit-Remaining-Endpoint', String(endpointResult.remaining));
    next();
  };
}

export { loadConfig, RateLimitStore };
