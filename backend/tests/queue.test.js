const request = require('supertest');
const app = require('../src/app');
const { connectDB, closeDB } = require('../src/config/db');
const { getRedisClient, closeRedis } = require('../src/config/redis');
const notificationService = require('../src/services/notification.service');
const emailWorker = require('../src/queues/workers/emailWorker');
const notificationWorker = require('../src/queues/workers/notificationWorker');
const refundWorker = require('../src/queues/workers/refundWorker');
const User = require('../src/models/user.model');
const Notification = require('../src/models/notification.model');
const { generateToken } = require('../src/utils/jwt');

describe('Redis & BullMQ Background Queue Suite', () => {
  let user, token;

  beforeAll(async () => {
    await connectDB();
    getRedisClient();

    user = await User.create({
      name: 'Queue User',
      email: `queue_${Date.now()}@example.com`,
      passwordHash: 'Password123!',
    });
    token = generateToken({ id: user._id, role: user.role, email: user.email });
  });

  afterAll(async () => {
    await Notification.deleteMany({ userId: user._id });
    await User.deleteMany({ _id: user._id });

    // Close BullMQ workers
    await Promise.all([
      emailWorker.close(),
      notificationWorker.close(),
      refundWorker.close(),
    ]);

    await closeDB();
    await closeRedis();
  });

  describe('BullMQ Email Queue & Worker', () => {
    it('should enqueue and process email job asynchronously', async () => {
      const job = await notificationService.enqueueEmail({
        to: user.email,
        subject: 'Booking Confirmation TRV-2026-X892A',
        type: 'BOOKING_CONFIRMATION',
        bookingReference: 'TRV-2026-X892A',
        user: { name: user.name },
      });

      expect(job).toBeDefined();
      expect(job.id).toBeDefined();

      // Wait for background worker processing
      await new Promise((resolve) => setTimeout(resolve, 300));
    });
  });

  describe('BullMQ Notification Queue & In-App API', () => {
    it('should enqueue notification, create Notification document, and expose via GET /api/notifications', async () => {
      const job = await notificationService.enqueueNotification({
        userId: user._id,
        title: 'Booking Confirmed!',
        message: 'Your flight to Delhi has been booked.',
        type: 'BOOKING_CONFIRMED',
        data: { bookingRef: 'TRV-2026-X892A' },
      });

      // Wait for background worker processing
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Verify notification retrieved via API
      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.notifications.length).toBeGreaterThan(0);
      expect(res.body.data.unreadCount).toBeGreaterThan(0);

      const notifId = res.body.data.notifications[0]._id;

      // Mark notification as read
      const readRes = await request(app)
        .patch(`/api/notifications/${notifId}/read`)
        .set('Authorization', `Bearer ${token}`);

      expect(readRes.status).toBe(200);
      expect(readRes.body.data.notification.isRead).toBe(true);
    });
  });
});
