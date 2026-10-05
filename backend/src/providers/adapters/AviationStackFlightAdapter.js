const BaseProvider = require('../base/BaseProvider');
const { normalizeFlight } = require('../normalizers/flightNormalizer');
const config = require('../../config');
const logger = require('../../utils/logger');
const ApiRateLimiter = require('../../utils/apiRateLimiter');
const { getRedisClient } = require('../../config/redis');
const MockFlightAdapter = require('./MockFlightAdapter');

/**
 * Real flight search via Aviationstack (https://aviationstack.com).
 *
 * Aviationstack gives real flight numbers, airlines, aircraft and scheduled
 * departure/arrival times for a route. It does NOT give ticket prices -
 * nobody publishes live GDS fares through a free public API (see the same
 * caveat on the RailRadar train adapter). Fares here are therefore
 * ESTIMATED from flight duration using typical Indian domestic/international
 * fare bands, and seat counts are synthesized. Both are tagged
 * `fareEstimated: true` / `seatsEstimated: true` so this is never mistaken
 * for a live bookable price.
 *
 * The free Aviationstack plan is only 100 requests/month and 10/minute, so
 * this adapter:
 *   1. Checks a Redis cache first (one real call covers every user
 *      searching the same route for hours).
 *   2. Only calls the upstream API if the cache misses AND the shared
 *      rate limiter has quota left.
 *   3. Falls back to MockFlightAdapter whenever the key is missing, the
 *      quota is exhausted, or the call fails - a flight search should never
 *      hard-fail just because a free-tier quota ran out.
 */

const SEARCH_CACHE_TTL_SECONDS = 6 * 60 * 60; // 6h: stretches a 100/month quota across real traffic

// Rough INR fare-per-minute bands by rough haul length - used only because
// Aviationstack has no pricing endpoint on any plan, free or paid.
function estimateFare(durationMinutes, stops) {
  const perMinute = durationMinutes <= 150 ? 28 : durationMinutes <= 300 ? 22 : 16; // longer = cheaper per-minute
  const base = Math.max(1800, Math.round((perMinute * durationMinutes) / 50) * 50);
  const stopPenalty = stops > 0 ? 0.85 : 1; // connections are usually a bit cheaper than non-stop
  const total = Math.round((base * stopPenalty) / 50) * 50;
  const taxes = Math.round(total * 0.12);
  return { base: total, taxes, total: total + taxes };
}

function seedHash(seed = '') {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return hash;
}

class AviationStackFlightAdapter extends BaseProvider {
  constructor() {
    super('AVIATIONSTACK_FLIGHT_PROVIDER', 'Aviationstack (real flight schedules)');
    this.mockFallback = new MockFlightAdapter();
    this.limiter = new ApiRateLimiter('aviationstack', { perMinute: 8, perMonth: 95 }); // small buffer under 10/min, 100/mo
  }

  isConfigured() {
    return Boolean(config.aviationStack.apiKey);
  }

  cacheKey(origin, destination, date) {
    return `cache:aviationstack:${origin}:${destination}:${date || 'any'}`;
  }

  async getCached(key) {
    try {
      const client = getRedisClient();
      const raw = await client.get(key);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      return null;
    }
  }

  async setCached(key, value) {
    try {
      const client = getRedisClient();
      await client.set(key, JSON.stringify(value), 'EX', SEARCH_CACHE_TTL_SECONDS);
    } catch (err) {
      logger.warn(`[Aviationstack] Failed to cache result: ${err.message}`);
    }
  }

  buildRaw(flight, origin, destination) {
    const dep = flight.departure || {};
    const arr = flight.arrival || {};
    const departureTime = dep.scheduled ? new