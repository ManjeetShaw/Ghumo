const request = require('supertest');
const app = require('../src/app');
const { connectDB, closeDB } = require('../src/config/db');
const { getRedisClient, closeRedis } = require('../src/config/redis');
const User = require('../src/models/user.model');

describe('Authentication & User Profile API Suite', () => {
  let authToken = '';
  let testUserId = '';

  const testUser = {
    name: 'Traveler Manjeet',
    email: `manjeet_${Date.now()}@example.com`,
    password: 'SecurePassword123!',
    phone: '+919876543210',
    preferences: {
      currency: 'INR',
      seatPreference: 'window',
      mealPreference: 'veg',
    },
  };

  beforeAll(async () => {
    await connectDB();
    getRedisClient();
  });

  afterAll(async () => {
    if (testUserId) {
      await User.findByIdAndDelete(testUserId);
    }
    await User.deleteMany({ email: /@example\.com$/ });
    await closeDB();
    await closeRedis();
  });

  describe('POST /api/auth/register', () => {
    it('should successfully register a new user and return JWT token', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
      expect(res.body.data.user).not.toHaveProperty('passwordHash');

      authToken = res.body.data.token;
      testUserId = res.body.data.user._id;

      // Verify database state
      const dbUser = await User.findById(testUserId);
      expect(dbUser).not.toBeNull();
      expect(dbUser.name).toBe(testUser.name);
    });

    it('should reject registration with an existing email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body.error.code).toBe('DUPLICATE_ERROR');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should successfully login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
    });

    it('should reject login with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword999!',
        });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });
  });

  describe('GET /api/auth/me (Protected)', () => {
    it('should return current logged-in user profile with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
      expect(res.body.data.user.preferences.seatPreference).toBe('window');
    });

    it('should reject access when no authorization header is provided', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should reject access with invalid token string', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_junk_token_123');

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('PATCH /api/users/profile', () => {
    it('should update user travel preferences and persist in MongoDB', async () => {
      const updatePayload = {
        phone: '+919999988888',
        preferences: {
          currency: 'USD',
          seatPreference: 'aisle',
          mealPreference: 'vegan',
          budgetPreference: 'luxury',
        },
      };

      const res = await request(app)
        .patch('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatePayload);

      expect(res.status).toBe(200);
      expect(res.body.data.user.phone).toBe('+919999988888');
      expect(res.body.data.user.preferences.seatPreference).toBe('aisle');
      expect(res.body.data.user.preferences.currency).toBe('USD');

      // Database verification
      const dbUser = await User.findById(testUserId);
      expect(dbUser.phone).toBe('+919999988888');
      expect(dbUser.preferences.seatPreference).toBe('aisle');
      expect(dbUser.preferences.currency).toBe('USD');
    });
  });
});
