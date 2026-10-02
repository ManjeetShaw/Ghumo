const { getRedisClient } = require('../config/redis');
const logger = require('./logger');

/**
 * Generic Redis-backed rate limiter for calling quota-limited third-party
 * APIs safely from a multi-request Node server (in-memory counters would be
 * wrong the moment there's more than one process/instance).
 *
 * Call reserve() BEFORE making the upstream request. It atomically checks
 * and increments both a per-minute and a calendar-month counter, and only
 * returns allowed:true if neither limit would be exceeded. This prevents a
 * burst of concurrent requests from all passing a "check" and then all
 * firing (the usual bug with check-then-increment rate limiting).
 */
class ApiRateLimiter {
  /**
   * @param {string} name - unique key prefix, e.g. 'aviationstack'
   * @param {{perMinute: number, perMonth: number}} limits
   */
  constructor(name, limits) {
    this.name = name;
    this.perMinute = limits.perMinute;
    this.perMonth = limits.perMonth;
  }

  async reserve() {
    try {
      const client = getRedisClient();
      const now = new Date();
      const minuteKey = `ratelimit:${this.name}:min:${Math.floor(now.getTime() / 60000)}`;
      const monthKey = `ratelimit:${this.name}:month:${now.getUTCFullYear()}-${now.getUTCMonth() + 1}`;

      const minuteCount = await client.incr(minuteKey);
      if (minuteCount === 1) await client.expire(minuteKey, 90);

      const monthCount = await client.incr(monthKey);
      if (monthCount === 1) await client.expire(monthKey, 40 * 24 * 60 * 60); // ~40 days, safely past month end

      if (minuteCount > this.perMinute) {
        await client.decr(monthKey); // give the month slot back; it wasn't actually used
        return { allowed: false, reason: 'PER_MINUTE_LIMIT', minuteCount, monthCount: monthCount - 1 };
      }
      if (monthCount > this.perMonth) {
        return { allowed: false, reason: 'MONTHLY_QUOTA', minuteCount, monthCount };
      }
      return { allowed: true, minuteCount, monthCount };
    } catch (err) {
      // If Redis is unreachable, fail CLOSED for a paid/metered API - better
      // to fall back to sample data than to risk an unmetered burst against
      // a provider that charges overage or bans on quota breach.
      logger.warn(`[RateLimiter:${this.name}] Redis unavailable (${err.message}); denying call as a precaution`);
      return { allowed: false, reason: 'LIMITER_UNAVAILABLE' };
    }
  }
}

module.exports = ApiRateLimiter;