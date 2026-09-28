const request = require('supertest');
const app = require('../src/app');
const { connectDB, closeDB } = require('../src/config/db');
const { getRedisClient, closeRedis } = require('../src/config/redis');

describe('Health Check API Endpoint', () => {
  beforeAll(async () => {
    await connectDB();
    getRedisClient();
  });

  afterAll(async () => {
    await closeDB();
    await closeRedis();
  });

  it('GET /api/health should return 200 and system health status', async () => {
    const response = await request(app).get('/api/health');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('status');
    expect(response.body.data).toHaveProperty('services');
    expect(response.body.data.services).toHaveProperty('database');
    expect(response.body.data.services.database.isConnected).toBe(true);
    expect(response.body.data.services).toHaveProperty('redis');
    expect(response.body.data.services.redis.isConnected).toBe(true);
  });

  it('GET /api/nonexistent-route should return 404 NOT_FOUND', async () => {
    const response = await request(app).get('/api/nonexistent-route');
    
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body.error).toHaveProperty('code', 'NOT_FOUND');
  });
});
