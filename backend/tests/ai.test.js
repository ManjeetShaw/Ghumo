const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/user.model');
const Trip = require('../src/models/trip.model');
const { generateToken } = require('../src/utils/jwt');
const { connectDB, closeDB } = require('../src/config/db');
const { closeRedis } = require('../src/config/redis');

describe('AI Travel Assistant API (Phase 9)', () => {
  let userToken;
  let testUserId;

  beforeAll(async () => {
    await connectDB();
    // Create test user
    const testUser = await User.create({
      name: 'AI Test User',
      email: 'aiuser@example.com',
      passwordHash: 'password123',
      role: 'USER',
    });
    testUserId = testUser._id;
    userToken = generateToken({ id: testUser._id, role: testUser.role });
  });

  afterAll(async () => {
    await User.deleteMany({ email: 'aiuser@example.com' });
    await Trip.deleteMany({ title: /AI/ });
    await closeDB();
    await closeRedis();
  });

  describe('POST /api/ai/travel-search', () => {
    it('should parse natural language search prompt for flights', async () => {
      const res = await request(app)
        .post('/api/ai/travel-search')
        .send({ prompt: 'Find cheap flights from Kolkata to Delhi under 5000' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.intent.category).toEqual('FLIGHT');
      expect(res.body.data.intent.origin).toEqual('CCU');
      expect(res.body.data.intent.destination).toEqual('DEL');
      expect(res.body.data.intent.maxPrice).toEqual(5000);
      expect(res.body.data.results.flights).toBeDefined();
    });

    it('should parse natural language prompt for hotels', async () => {
      const res = await request(app)
        .post('/api/ai/travel-search')
        .send({ prompt: 'Book luxury hotel stay in Jaipur under 8000' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.intent.category).toEqual('HOTEL');
      expect(res.body.data.results.hotels).toBeDefined();
    });

    it('should return 400 error if prompt is missing', async () => {
      const res = await request(app)
        .post('/api/ai/travel-search')
        .send({});

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/ai/itinerary', () => {
    it('should generate structured itinerary and create a saved trip for authenticated user', async () => {
      const res = await request(app)
        .post('/api/ai/itinerary')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          destination: 'Jaipur',
          days: 3,
          budget: 15000,
          title: '3-Day AI Jaipur Exploration',
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.destination).toEqual('Jaipur');
      expect(res.body.data.daysCount).toEqual(3);
      expect(res.body.data.days.length).toEqual(3);
      expect(res.body.data.trip).toBeDefined();
      expect(res.body.data.trip.userId.toString()).toEqual(testUserId.toString());
    });

    it('should generate itinerary without saving trip for guest user', async () => {
      const res = await request(app)
        .post('/api/ai/itinerary')
        .send({
          destination: 'Agra',
          days: 2,
          budget: 10000,
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.destination).toEqual('Agra');
      expect(res.body.data.daysCount).toEqual(2);
      expect(res.body.data.trip).toBeNull();
    });
  });
});
