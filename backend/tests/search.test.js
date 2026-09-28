const request = require('supertest');
const app = require('../src/app');
const { connectDB, closeDB } = require('../src/config/db');
const { getRedisClient, closeRedis } = require('../src/config/redis');

describe('Unified Search Engine & Central Pricing API Suite', () => {
  beforeAll(async () => {
    await connectDB();
    getRedisClient();
  });

  afterAll(async () => {
    await closeDB();
    await closeRedis();
  });

  describe('GET /api/flights/search', () => {
    it('should search flights with price filter and return normalized results', async () => {
      const res = await request(app)
        .get('/api/flights/search')
        .query({ origin: 'CCU', destination: 'DEL', maxPrice: 5000, sortBy: 'price_asc' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.flights)).toBe(true);
      expect(res.body.data.flights.length).toBeGreaterThan(0);

      const firstFlight = res.body.data.flights[0];
      expect(firstFlight.origin.code).toBe('CCU');
      expect(firstFlight.destination.code).toBe('DEL');
      expect(firstFlight.price.total).toBeLessThanOrEqual(5000);
    });
  });

  describe('GET /api/trains/search', () => {
    it('should search trains and filter by class code CC', async () => {
      const res = await request(app)
        .get('/api/trains/search')
        .query({ origin: 'NDLS', destination: 'AGC', classCode: 'CC' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.trains)).toBe(true);
      expect(res.body.data.trains.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/buses/search', () => {
    it('should search intercity buses between Agra and Jaipur', async () => {
      const res = await request(app)
        .get('/api/buses/search')
        .query({ origin: 'Agra', destination: 'Jaipur' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.buses)).toBe(true);
      expect(res.body.data.buses.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/hotels/search', () => {
    it('should search hotels by city and minimum star rating', async () => {
      const res = await request(app)
        .get('/api/hotels/search')
        .query({ city: 'Delhi', minRating: 4.5 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.hotels)).toBe(true);
      expect(res.body.data.hotels.length).toBeGreaterThan(0);
      expect(res.body.data.hotels[0].rating).toBeGreaterThanOrEqual(4.5);
    });
  });

  describe('GET /api/search/all (Multimodal Aggregator)', () => {
    it('should return aggregated flights, trains, buses, and hotels in a single call', async () => {
      const res = await request(app)
        .get('/api/search/all')
        .query({ origin: 'CCU', destination: 'DEL' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('summary');
      expect(res.body.data).toHaveProperty('results');
      expect(res.body.data.results).toHaveProperty('flights');
      expect(res.body.data.results).toHaveProperty('trains');
      expect(res.body.data.results).toHaveProperty('buses');
      expect(res.body.data.results).toHaveProperty('hotels');
      expect(res.body.data.summary.totalFlights).toBeGreaterThan(0);
    });
  });

  describe('POST /api/pricing/quote (Central Pricing Engine)', () => {
    it('should calculate accurate taxes, service fee, and coupon discount', async () => {
      const payload = {
        category: 'FLIGHT',
        baseFare: 4000,
        couponCode: 'WELCOME10',
      };

      const res = await request(app)
        .post('/api/pricing/quote')
        .send(payload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const quote = res.body.data.quote;

      expect(quote.baseFare).toBe(4000);
      expect(quote.taxes).toBe(480); // 12% of 4000
      expect(quote.serviceFee).toBe(150); // Flight platform fee
      expect(quote.discountAmount).toBe(400); // 10% of 4000
      expect(quote.appliedCoupon).toBe('WELCOME10');
      expect(quote.totalAmount).toBe(4000 + 480 + 150 - 400); // 4230
    });
  });
});
