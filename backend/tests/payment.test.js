// Razorpay is stubbed at the network boundary (createOrder / processRefund);
// signature verification runs for real against a test secret.
process.env.RAZORPAY_KEY_ID = 'rzp_test_unit';
process.env.RAZORPAY_KEY_SECRET = 'unit_test_key_secret';
process.env.RAZORPAY_WEBHOOK_SECRET = 'unit_test_webhook_secret';

const crypto = require('crypto');
const request = require('supertest');
const app = require('../src/app');
const { connectDB, closeDB } = require('../src/config/db');
const { getRedisClient, closeRedis } = require('../src/config/redis');
const User = require('../src/models/user.model');
const Booking = require('../src/models/booking.model');
const Payment = require('../src/models/payment.model');
const razorpay = require('../src/providers/adapters/RazorpayProvider');
const { generateToken } = require('../src/utils/jwt');

const hmac = (secret, data) => crypto.createHmac('sha256', secret).update(data).digest('hex');

describe('Razorpay payment flow', () => {
  let user, token, bookingId, gatewayOrderId;

  beforeAll(async () => {
    await connectDB();
    getRedisClient();

    jest.spyOn(razorpay, 'createOrder').mockImplementation(async ({ amount, currency }) => ({
      gatewayOrderId: `order_test_${Date.now()}`,
      amount,
      currency,
      keyId: 'rzp_test_unit',
    }));

    user = await User.create({
      name: 'Payer Traveler',
      email: `payer_${Date.now()}@example.com`,
      passwordHash: 'Password123!',
    });
    token = generateToken({ id: user._id, role: user.role, email: user.email });

    const bookingRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        category: 'HOTEL',
        providerId: 'MOCK_HOTEL_PROVIDER',
        details: { name: 'The Leela Palace Delhi', price: { base: 10000 } },
      });
    bookingId = bookingRes.body.data.booking._id;
  });

  afterAll(async () => {
    jest.restoreAllMocks();
    await Payment.deleteMany({ userId: user._id });
    await Booking.deleteMany({ userId: user._id });
    await User.deleteMany({ _id: user._id });
    await closeDB();
    await closeRedis();
  });

  it('creates an order using the server-side booking amount', async () => {
    const res = await request(app)
      .post('/api/payments/create-order')
      .set('Authorization', `Bearer ${token}`)
      .send({ bookingId, amount: 1 }); // client-sent amount must be ignored

    expect(res.status).toBe(201);
    expect(res.body.data.order.gatewayKey).toBe('rzp_test_unit');
    expect(res.body.data.order.amount).toBeGreaterThan(1);
    gatewayOrderId = res.body.data.order.gatewayOrderId;

    const dbPayment = await Payment.findOne({ gatewayOrderId });
    expect(dbPayment.status).toBe('CREATED');
  });

  it('rejects a checkout callback with a bad signature', async () => {
    const res = await request(app)
      .post('/api/payments/verify')
      .set('Authorization', `Bearer ${token}`)
      .send({ gatewayOrderId, gatewayPaymentId: 'pay_x', signature: 'deadbeef' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_SIGNATURE');
  });

  it('accepts a valid checkout signature, confirms the booking, and is idempotent', async () => {
    const paymentId = 'pay_test_123';
    const signature = hmac('unit_test_key_secret', `${gatewayOrderId}|${paymentId}`);

    const res = await request(app)
      .post('/api/payments/verify')
      .set('Authorization', `Bearer ${token}`)
      .send({ gatewayOrderId, gatewayPaymentId: paymentId, signature });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('SUCCESS');

    const dbBooking = await Booking.findById(bookingId);
    expect(dbBooking.status).toBe('TICKET_ISSUED');

    const again = await request(app)
      .post('/api/payments/verify')
      .set('Authorization', `Bearer ${token}`)
      .send({ gatewayOrderId, gatewayPaymentId: paymentId, signature });
    expect(again.status).toBe(200);
  });

  it('rejects a webhook with a bad signature and accepts a correctly signed one', async () => {
    const event = {
      event: 'payment.captured',
      payload: { payment: { entity: { id: 'pay_test_123', order_id: gatewayOrderId } } },
    };
    const raw = JSON.stringify(event);

    const bad = await request(app)
      .post('/api/payments/webhook')
      .set('Content-Type', 'application/json')
      .set('X-Razorpay-Signature', 'deadbeef')
      .send(raw);
    expect(bad.status).toBe(401);

    const good = await request(app)
      .post('/api/payments/webhook')
      .set('Content-Type', 'application/json')
      .set('X-Razorpay-Signature', hmac('unit_test_webhook_secret', raw))
      .send(raw);
    expect(good.status).toBe(200);
  });

  it('no longer exposes the mock checkout endpoint', async () => {
    const res = await request(app).post('/api/payments/mock-checkout').send({});
    expect(res.status).toBe(404);
  });
});
