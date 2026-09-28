const request = require('supertest');
const app = require('../src/app');
const { connectDB, closeDB } = require('../src/config/db');
const { getRedisClient, closeRedis } = require('../src/config/redis');
const User = require('../src/models/user.model');
const Booking = require('../src/models/booking.model');
const bookingStateMachine = require('../src/services/bookingStateMachine');
const { generateToken } = require('../src/utils/jwt');

describe('Booking Engine & Booking State Machine API Suite', () => {
  let userA, tokenA;
  let userB, tokenB;
  let createdBookingId;
  const idempotencyKey = `IDEM-KEY-${Date.now()}`;

  const flightBookingPayload = {
    category: 'FLIGHT',
    providerId: 'MOCK_FLIGHT_PROVIDER',
    details: {
      flightNumber: '6E-204',
      airline: 'IndiGo',
      origin: { code: 'CCU', city: 'Kolkata' },
      destination: { code: 'DEL', city: 'Delhi' },
      departureTime: new Date(Date.now() + 86400000).toISOString(),
      arrivalTime: new Date(Date.now() + 86400000 + 8100000).toISOString(),
      price: { base: 4000, taxes: 480, total: 4480 },
    },
    passengers: [
      { name: 'Manjeet Shaw', age: 28, gender: 'M', seatNumber: '12A' },
    ],
    couponCode: 'WELCOME10',
  };

  beforeAll(async () => {
    await connectDB();
    getRedisClient();

    userA = await User.create({
      name: 'Booking User A',
      email: `booking_usera_${Date.now()}@example.com`,
      passwordHash: 'Password123!',
    });
    tokenA = generateToken({ id: userA._id, role: userA.role, email: userA.email });

    userB = await User.create({
      name: 'Booking User B',
      email: `booking_userb_${Date.now()}@example.com`,
      passwordHash: 'Password123!',
    });
    tokenB = generateToken({ id: userB._id, role: userB.role, email: userB.email });
  });

  afterAll(async () => {
    await Booking.deleteMany({ userId: { $in: [userA._id, userB._id] } });
    await User.deleteMany({ _id: { $in: [userA._id, userB._id] } });
    await closeDB();
    await closeRedis();
  });

  describe('POST /api/bookings (Create Booking Intent)', () => {
    it('should create booking intent with server-validated pricing and PAYMENT_PENDING state', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${tokenA}`)
        .set('Idempotency-Key', idempotencyKey)
        .send(flightBookingPayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.booking.bookingReference).toMatch(/^TRV-2026-/);
      expect(res.body.data.booking.status).toBe('PAYMENT_PENDING');
      expect(res.body.data.booking.pricing.totalAmount).toBe(4230); // 4000 base + 480 tax + 150 fee - 400 coupon

      createdBookingId = res.body.data.booking._id;

      // Verify MongoDB persistence
      const dbBooking = await Booking.findById(createdBookingId);
      expect(dbBooking).not.toBeNull();
      expect(dbBooking.userId.toString()).toBe(userA._id.toString());
    });

    it('should return cached response idempotently for duplicate request with same Idempotency-Key', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${tokenA}`)
        .set('Idempotency-Key', idempotencyKey)
        .send(flightBookingPayload);

      expect(res.status).toBe(201);
      expect(res.body.data.booking._id).toBe(createdBookingId);

      // Verify no duplicate booking was created in MongoDB
      const count = await Booking.countDocuments({ idempotencyKey });
      expect(count).toBe(1);
    });
  });

  describe('POST /api/bookings/:id/confirm (Confirm Booking)', () => {
    it('should transition through state machine to CONFIRMED and TICKET_ISSUED with PNR', async () => {
      const res = await request(app)
        .post(`/api/bookings/${createdBookingId}/confirm`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.booking.status).toBe('TICKET_ISSUED');
      expect(res.body.data.booking.providerBookingRef).toMatch(/^PNR-/);
    });
  });

  describe('Booking State Machine Validation', () => {
    it('should reject invalid state transitions (e.g., TICKET_ISSUED directly to PAYMENT_PENDING)', async () => {
      const booking = await Booking.findById(createdBookingId);
      expect(booking.status).toBe('TICKET_ISSUED');

      await expect(
        bookingStateMachine.transition(booking, 'PAYMENT_PENDING')
      ).rejects.toThrow('Invalid booking state transition');
    });
  });

  describe('POST /api/bookings/:id/cancel (Cancel Booking)', () => {
    it('should allow user to cancel ticketed booking and transition to CANCELLED and REFUND_PENDING', async () => {
      const res = await request(app)
        .post(`/api/bookings/${createdBookingId}/cancel`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ reason: 'Plans changed due to weather' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.booking.status).toBe('REFUND_PENDING');
      expect(res.body.data.booking.cancellationReason).toBe('Plans changed due to weather');
    });

    it("should DENY User B access to cancel User A's booking", async () => {
      const res = await request(app)
        .post(`/api/bookings/${createdBookingId}/cancel`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ reason: 'Unauthorized cancellation' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });
  });
});
