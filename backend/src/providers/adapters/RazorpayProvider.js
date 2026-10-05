const crypto = require('crypto');
const config = require('../../config');

const API = 'https://api.razorpay.com/v1';

/**
 * Razorpay payment gateway (works with test-mode keys `rzp_test_*` and live keys).
 * Uses the REST API directly, so no extra SDK dependency is required.
 * Docs: https://razorpay.com/docs/api/orders/ , /payments/refunds/ , /webhooks/validate-test/
 */
class RazorpayProvider {
  get keyId() { return config.razorpay.keyId; }
  get keySecret() { return config.razorpay.keySecret; }

  isConfigured() {
    return Boolean(this.keyId && this.keySecret);
  }

  assertConfigured() {
    if (!this.isConfigured()) {
      const error = new Error('Payment gateway is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.');
      error.statusCode = 503;
      error.errorCode = 'PAYMENT_GATEWAY_NOT_CONFIGURED';
      throw error;
    }
  }

  async call(path, body) {
    this.assertConfigured();
    const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
    const res = await fetch(`${API}${path}`, {
      method: 'POST',
      headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const error = new Error(`Razorpay error: ${data?.error?.description || res.statusText}`);
      error.statusCode = 502;
      error.errorCode = 'PAYMENT_GATEWAY_ERROR';
      throw error;
    }
    return data;
  }

  /** amount is in rupees; Razorpay expects paise. */
  async createOrder({ bookingReference, amount, currency = 'INR' }) {
    const order = await this.call('/orders', {
      amount: Math.round(amount * 100),
      currency,
      receipt: bookingReference,
      notes: { bookingReference },
    });
    return { gatewayOrderId: order.id, amount, currency, keyId: this.keyId };
  }

  /** Checkout callback signature: HMAC_SHA256(order_id|payment_id, key_secret) */
  verifyCheckoutSignature(gatewayOrderId, gatewayPaymentId, signature) {
    if (!signature || !this.keySecret) return false;
    const expected = crypto
      .createHmac('sha256', this.keySecret)
      .update(`${gatewayOrderId}|${gatewayPaymentId}`)
      .digest('hex');
    return this.safeEqual(expected, signature);
  }

  /** Webhook signature: HMAC_SHA256(raw request body, webhook secret) */
  verifyWebhookSignature(rawBody, signature) {
    const secret = config.razorpay.webhookSecret;
    if (!signature || !secret || !rawBody) return false;
    const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
    return this.safeEqual(expected, signature);
  }

  safeEqual(a, b) {
    try {
      return crypto.timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));
    } catch (err) {
      return false;
    }
  }

  async processRefund({ gatewayPaymentId, amount }) {
    const refund = await this.call(`/payments/${gatewayPaymentId}/refund`, {
      amount: Math.round(amount * 100),
    });
    return { success: true, refundId: refund.id, status: refund.status };
  }
}

module.exports = new RazorpayProvider();