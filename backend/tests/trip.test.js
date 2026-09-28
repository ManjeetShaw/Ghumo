const request = require('supertest');
const app = require('../src/app');
const { connectDB, closeDB } = require('../src/config/db');
const { getRedisClient, closeRedis } = require('../src/config/redis');
const User = require('../src/models/user.model');
const Trip = require('../src/models/trip.model');
const { generateToken } = require('../src/utils/jwt');

describe('Trip Management & Itinerary API Suite', () => {
  let userA, tokenA;
  let userB, tokenB;
  let createdTripId;
  let createdItineraryItemId;

  beforeAll(async () => {
    await connectDB();
    getRedisClient();

    // Setup Test User A
    userA = await User.create({
      name: 'User A Traveler',
      email: `usera_${Date.now()}@example.com`,
      passwordHash: 'Password123!',
    });
    tokenA = generateToken({ id: userA._id, role: userA.role, email: userA.email });

    // Setup Test User B
    userB = await User.create({
      name: 'User B Traveler',
      email: `userb_${Date.now()}@example.com`,
      passwordHash: 'Password123!',
    });
    tokenB = generateToken({ id: userB._id, role: userB.role, email: userB.email });
  });

  afterAll(async () => {
    await Trip.deleteMany({ userId: { $in: [userA._id, userB._id] } });
    await User.deleteMany({ _id: { $in: [userA._id, userB._id] } });
    await closeDB();
    await closeRedis();
  });

  describe('POST /api/trips (Create Trip)', () => {
    it('should create a multi-destination trip for User A', async () => {
      const tripData = {
        title: 'Golden Triangle Heritage Tour',
        description: 'Kolkata -> Delhi -> Agra -> Jaipur -> Kolkata',
        startDate: '2026-10-01',
        endDate: '2026-10-10',
        destinations: [
          { city: 'Delhi', country: 'India', arrivalDate: '2026-10-01', departureDate: '2026-10-03' },
          { city: 'Agra', country: 'India', arrivalDate: '2026-10-03', departureDate: '2026-10-05' },
          { city: 'Jaipur', country: 'India', arrivalDate: '2026-10-05', departureDate: '2026-10-09' },
        ],
        budget: {
          totalBudget: 45000,
          currency: 'INR',
        },
      };

      const res = await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${tokenA}`)
        .send(tripData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.trip.title).toBe(tripData.title);
      expect(res.body.data.trip.destinations.length).toBe(3);

      createdTripId = res.body.data.trip._id;

      // Verify MongoDB persistence
      const dbTrip = await Trip.findById(createdTripId);
      expect(dbTrip).not.toBeNull();
      expect(dbTrip.userId.toString()).toBe(userA._id.toString());
    });
  });

  describe('GET /api/trips (List Trips)', () => {
    it("should list User A's trips", async () => {
      const res = await request(app)
        .get('/api/trips')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.trips.length).toBe(1);
      expect(res.body.data.pagination.total).toBe(1);
    });

    it("should return empty list for User B (User isolation)", async () => {
      const res = await request(app)
        .get('/api/trips')
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(200);
      expect(res.body.data.trips.length).toBe(0);
    });
  });

  describe('GET /api/trips/:id & Security Checks', () => {
    it("should allow User A to retrieve their own trip", async () => {
      const res = await request(app)
        .get(`/api/trips/${createdTripId}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.trip._id).toBe(createdTripId);
    });

    it("should DENY User B access to User A's trip (Security Test)", async () => {
      const res = await request(app)
        .get(`/api/trips/${createdTripId}`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('POST /api/trips/:id/itinerary (Add Itinerary Item)', () => {
    it('should add a Flight item and recalculate allocated/spent budget', async () => {
      const flightItem = {
        type: 'FLIGHT',
        title: 'Flight CCU -> DEL (IndiGo 6E-204)',
        date: '2026-10-01',
        startTime: '06:30',
        endTime: '08:45',
        estimatedCost: 4500,
        actualCost: 4200,
        bookingRef: 'PNR-INDIGO-882',
      };

      const res = await request(app)
        .post(`/api/trips/${createdTripId}/itinerary`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send(flightItem);

      expect(res.status).toBe(201);
      expect(res.body.data.trip.itinerary.length).toBe(1);
      expect(res.body.data.trip.budget.allocated).toBe(4500);
      expect(res.body.data.trip.budget.spent).toBe(4200);

      createdItineraryItemId = res.body.data.trip.itinerary[0]._id;
    });

    it('should add a Hotel item and accumulate budget totals', async () => {
      const hotelItem = {
        type: 'HOTEL',
        title: 'The Imperial Hotel Delhi (2 Nights)',
        date: '2026-10-01',
        estimatedCost: 12000,
        actualCost: 11500,
      };

      const res = await request(app)
        .post(`/api/trips/${createdTripId}/itinerary`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send(hotelItem);

      expect(res.status).toBe(201);
      expect(res.body.data.trip.itinerary.length).toBe(2);
      expect(res.body.data.trip.budget.allocated).toBe(16500); // 4500 + 12000
      expect(res.body.data.trip.budget.spent).toBe(15700); // 4200 + 11500
    });
  });

  describe('DELETE /api/trips/:id/itinerary/:itemId (Delete Itinerary Item)', () => {
    it('should remove flight item and recalculate budget correctly', async () => {
      const res = await request(app)
        .delete(`/api/trips/${createdTripId}/itinerary/${createdItineraryItemId}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.trip.itinerary.length).toBe(1);
      expect(res.body.data.trip.budget.allocated).toBe(12000); // Only hotel remains
      expect(res.body.data.trip.budget.spent).toBe(11500);
    });
  });

  describe('DELETE /api/trips/:id (Delete Trip)', () => {
    it('should delete the trip and remove from database', async () => {
      const res = await request(app)
        .delete(`/api/trips/${createdTripId}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);

      const dbTrip = await Trip.findById(createdTripId);
      expect(dbTrip).toBeNull();
    });
  });
});
