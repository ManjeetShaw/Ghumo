const BaseProvider = require('../base/BaseProvider');
const { normalizeTrain } = require('../normalizers/trainNormalizer');
const config = require('../../config');
const logger = require('../../utils/logger');
const MockTrainAdapter = require('./MockTrainAdapter');

/**
 * Real Indian Railways train search via RailRadar (https://railradar.in).
 *
 * RailRadar provides real train numbers, names, timetables, routes and
 * reserved-class lists from Indian Railways data. It does NOT provide live
 * fares or seat availability - nobody publishes IRCTC's live PRS booking/
 * pricing data publicly, so no legitimate API anywhere offers that. Fares
 * here are therefore ESTIMATED from real distance x published per-km fare
 * bands, and seat counts are synthesized. Both are clearly flagged in the
 * returned data (`fareEstimated: true`, `seatsEstimated: true`) rather than
 * presented as live PRS figures.
 *
 * Falls back to MockTrainAdapter if no API key is configured, or if a
 * RailRadar call fails (rate limit, outage, bad station code), so a train
 * search never hard-fails just because the upstream quota (1,000 req/month
 * on the free tier) or availability is an issue.
 */

// Rough, publicly-known Indian Railways fare bands (INR per km) by class.
// These approximate real IRCTC base fares; they are not live PRS pricing.
const FARE_PER_KM = {
  '1A': 3.8, '2A': 2.2, '3A': 1.55, '3E': 1.4, 'CC': 1.15,
  'EC': 2.05, 'SL': 0.55, '2S': 0.2, 'FC': 3.0,
};
const MIN_FARE = { '1A': 900, '2A': 550, '3A': 400, '3E': 380, 'CC': 250, 'EC': 450, 'SL': 110, '2S': 35, 'FC': 700 };
const CLASS_NAMES = {
  '1A': 'AC First Class', '2A': 'AC 2 Tier', '3A': 'AC 3 Tier', '3E': 'AC 3 Economy',
  'CC': 'AC Chair Car', 'EC': 'Executive Chair Car', 'SL': 'Sleeper', '2S': 'Second Sitting', 'FC': 'First Class',
};

let prsCache = { data: null, fetchedAt: 0 };
const PRS_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // directory barely changes; cache a day to save quota

function seedHash(seed = '') {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return hash;
}

class RailRadarTrainAdapter extends BaseProvider {
  constructor() {
    super('RAILRADAR_TRAIN_PROVIDER', 'RailRadar (Indian Railways)');
    this.mockFallback = new MockTrainAdapter();
  }

  isConfigured() {
    return Boolean(config.railRadar.apiKey);
  }

  async call(path, { query } = {}) {
    const url = new URL(`${config.railRadar.baseUrl}${path}`);
    Object.entries(query || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
    });

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${config.railRadar.apiKey}` },
    });
    const body = await res.json().catch(() => ({}));

    if (!res.ok || body.success === false) {
      const error = new Error(body?.error?.message || `RailRadar request failed (${res.status})`);
      error.statusCode = res.status;
      throw error;
    }
    return body.data;
  }

  async getPrsClasses(trainNumber) {
    try {
      if (!prsCache.data || Date.now() - prsCache.fetchedAt > PRS_CACHE_TTL_MS) {
        const data = await this.call('/lookup/trains/prs');
        prsCache = { data, fetchedAt: Date.now() };
      }
      return prsCache.data?.[trainNumber]?.classes || null;
    } catch (err) {
      logger.warn(`[RailRadar] PRS class lookup failed: ${err.message}`);
      return null;
    }
  }

  estimateClasses(trainNumber, trainType, distanceKm) {
    // Reserved-class trains (Rajdhani/Shatabdi/Vande Bharat/etc.) vs general.
    const premiumTypes = ['rajdhani', 'shatabdi', 'vande-bharat', 'duronto', 'garib-rath'];
    const defaultClasses = premiumTypes.includes((trainType || '').toLowerCase())
      ? ['EC', 'CC']
      : ['SL', '3A', '2A', '1A'];

    return defaultClasses.map((code) => {
      const perKm = FARE_PER_KM[code] || 1;
      const fare = Math.round(Math.max(MIN_FARE[code] || 100, perKm * (distanceKm || 400)) / 5) * 5;
      const hash = seedHash(`${trainNumber}-${code}`);
      const seatsAvailable = hash % 50; // synthetic - no live PRS availability exists publicly
      return {
        classCode: code,
        className: CLASS_NAMES[code] || code,
        fare,
        fareEstimated: true,
        seatsAvailable,
        seatsEstimated: true,
        status: seatsAvailable > 0 ? 'AVAILABLE' : `WL-${(hash % 20) + 1}`,
      };
    });
  }

  async search(params = {}) {
    const { origin, destination, date } = params;
    if (!origin || !destination) {
      return this.mockFallback.search(params);
    }

    if (!this.isConfigured()) {
      logger.warn('[RailRadar] RAILRADAR_API_KEY not set; falling back to sample train data');
      return this.mockFallback.search(params);
    }

    try {
      const data = await this.call(`/trains/between/${origin.toUpperCase()}/${destination.toUpperCase()}`, {
        query: { date },
      });

      const results = await Promise.all(
        (data.trains || []).map(async (t) => {
          const prsClasses = await this.getPrsClasses(t.train.number);
          const classes = prsClasses
            ? prsClasses.map((code) => {
                const perKm = FARE_PER_KM[code] || 1;
                const fare = Math.round(Math.max(MIN_FARE[code] || 100, perKm * (t.distance || 400)) / 5) * 5;
                const hash = seedHash(`${t.train.number}-${code}`);
                const seatsAvailable = hash % 50;
                return {
                  classCode: code,
                  className: CLASS_NAMES[code] || code,
                  fare,
                  fareEstimated: true,
                  seatsAvailable,
                  seatsEstimated: true,
                  status: seatsAvailable > 0 ? 'AVAILABLE' : `WL-${(hash % 20) + 1}`,
                };
              })
            : this.estimateClasses(t.train.number, t.train.type, t.distance);

          const base = new Date();
          const [depH, depM] = (t.from.departure || '00:00').split(':').map(Number);
          const departureTime = new Date(base);
          departureTime.setHours(depH, depM, 0, 0);
          if (date) departureTime.setFullYear(...new Date(date).toISOString().slice(0, 10).split('-').map(Number));
          const arrivalTime = new Date(departureTime.getTime() + (t.duration || 0) * 60000);

          return normalizeTrain(
            {
              trainNumber: t.train.number,
              trainName: t.train.name,
              originCode: data.from.code,
              originStation: data.from.name,
              destinationCode: data.to.code,
              destinationStation: data.to.name,
              departureTime,
              arrivalTime,
              durationMinutes: t.duration,
              classes,
            },
            this.providerId
          );
        })
      );

      return results;
    } catch (err) {
      logger.warn(`[RailRadar] Search failed (${err.message}); falling back to sample train data`);
      return this.mockFallback.search(params);
    }
  }

  async getDetails(trainNumber) {
    const results = await this.search({ origin: '', destination: '' });
    const found = results.find((t) => t.trainNumber === trainNumber || t.id === trainNumber);
    if (!found) throw new Error(`Train ${trainNumber} not found`);
    return found;
  }

  async checkAvailability(trainNumber, params = {}) {
    // No legitimate public source for live PRS seat availability exists;
    // this mirrors the synthetic estimate already attached to search results.
    return this.mockFallback.checkAvailability(trainNumber, params);
  }

  async createReservation(reservationData) {
    // RailRadar is read-only (schedules/tracking); it has no booking API,
    // and no public Indian Railways booking API exists for third parties.
    return this.mockFallback.createReservation(reservationData);
  }

  async cancelReservation(providerBookingRef) {
    return this.mockFallback.cancelReservation(providerBookingRef);
  }
}

module.exports = RailRadarTrainAdapter;