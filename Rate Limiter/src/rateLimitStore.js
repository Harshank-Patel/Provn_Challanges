import { TokenBucket } from './tokenBucket.js';

/**
 * In-memory bucket registry keyed by limit dimension (org, endpoint class, etc.).
 */
export class RateLimitStore {
  constructor({ bucketTtlMs = 3_600_000, cleanupIntervalMs = 300_000 } = {}) {
    this.buckets = new Map();
    this.bucketTtlMs = bucketTtlMs;
    this.cleanupIntervalMs = cleanupIntervalMs;
    this._cleanupTimer = setInterval(() => this.cleanup(), cleanupIntervalMs);
    if (this._cleanupTimer.unref) this._cleanupTimer.unref();
  }

  getOrCreateBucket(key, { capacity, requestsPerMinute }) {
    const existing = this.buckets.get(key);
    const now = Date.now();

    if (existing) {
      existing.lastAccessMs = now;
      return existing.bucket;
    }

    const bucket = new TokenBucket({ capacity, requestsPerMinute });
    this.buckets.set(key, { bucket, lastAccessMs: now });
    return bucket;
  }

  cleanup() {
    const cutoff = Date.now() - this.bucketTtlMs;
    for (const [key, entry] of this.buckets) {
      if (entry.lastAccessMs < cutoff) {
        this.buckets.delete(key);
      }
    }
  }

  size() {
    return this.buckets.size;
  }

  destroy() {
    clearInterval(this._cleanupTimer);
    this.buckets.clear();
  }
}
