/**
 * Token bucket rate limiter.
 *
 * Allows sustained rate (refill) plus bounded bursts (capacity).
 * refillRate = requestsPerMinute / 60 tokens per second.
 */
export class TokenBucket {
  constructor({ capacity, requestsPerMinute }) {
    this.capacity = capacity;
    this.refillRate = requestsPerMinute / 60;
    this.tokens = capacity;
    this.lastRefillMs = Date.now();
  }

  refill(now = Date.now()) {
    const elapsedSec = (now - this.lastRefillMs) / 1000;
    if (elapsedSec <= 0) return;

    this.tokens = Math.min(this.capacity, this.tokens + elapsedSec * this.refillRate);
    this.lastRefillMs = now;
  }

  /**
   * Try to consume one token.
   * @returns {{ allowed: boolean, retryAfterSec: number, remaining: number }}
   */
  tryConsume() {
    const now = Date.now();
    this.refill(now);

    if (this.tokens >= 1) {
      this.tokens -= 1;
      return {
        allowed: true,
        retryAfterSec: 0,
        remaining: Math.floor(this.tokens),
      };
    }

    const deficit = 1 - this.tokens;
    const retryAfterSec = Math.ceil(deficit / this.refillRate);

    return {
      allowed: false,
      retryAfterSec: Math.max(1, retryAfterSec),
      remaining: 0,
    };
  }
}
