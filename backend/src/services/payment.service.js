const Payment = require('../models/payment.model');
const bookingService = require('./booking.service');
const razorpay = require('../providers/adapters/RazorpayProvider');
const logger = require('../utils/logger');

class PaymentService {
  async createPaymentOrder(userId, bookingId) {
    const booking = await bookingService.getBookingById(userId, bookingId);

    if (booking.status !== 'PAYMENT_PENDING' && booking.status !== 'INITIATED') {
      const error = new Error(`Cannot initiate payment for booking in '${booking.status}' state`);
      error.statusCode = 400;
      error.errorCode = 'INVALID_BOOKING_STATE';
      throw error;
    }

    // Amount always comes from the server-side booking, never from the client.
    const order = await razorpay.createOrder({
      bookingReference: booking.bookingReference,
      amount: booking.pricing.totalAmount,
      currency: booking.pricing.currency,
    });

    const payment = await Payment.create({
      orderId: `PAY-ORD-${booking.bookingReference}-${Date.now().toString(36).toUpperCase()}`,
      gatewayOrderId: order.gatewayOrderId,
      bookingId: booking._id,
      userId: booking.userId,
      amount: booking.pricing.totalAmount,
      currency: booking.pricing.currency,
      status: 'CREATED',
      paymentGateway: 'RAZORPAY',
    });

    return {
      orderId: payment.orderId,
      gatewayOrderId: order.gatewayOrderId,
      gatewayKey: order.keyId,
      bookingReference: booking.bookingReference,
      amount: payment.amount,
      currency: payment.currency,
    };
  }

  /** Called by the browser after Razorpay Checkout succeeds. */
  async verifyCheckoutPayment(userId, { gatewayOrderId, gatewayPaymentId, signature }) {
    const payment = await Payment.findOne({ gatewayOrderId, userId });
    if (!payment) {
      const error = new Error('Payment record not found');
      error.statusCode = 404;
      error.errorCode = 'NOT_FOUND';
      throw error;
    }

    if (!razorpay.verifyCheckoutSignature(gatewayOrderId, gatewayPaymentId, signature)) {
      logger.warn(`Invalid Razorpay checkout signature for order '${gatewayOrderId}'`);
      const error = new Error('Invalid payment signature');
      error.statusCode = 400;
      error.errorCode = 'INVALID_SIGNATURE';
      throw error;
    }

    return this.markPaid(payment, gatewayPaymentId, signature);
  }

  /** Razorpay server-to-server webhook (payment.captured / payment.failed). */
  async handleWebhook(rawBody, signature, event) {
    if (!razorpay.verifyWebhookSignature(rawBody, signature)) {
      logger.warn('Invalid Razorpay webhook signature');
      const error = new Error('Invalid webhook signature');
      error.statusCode = 401;
      error.errorCode = 'INVALID_SIGNATURE';
      throw error;
    }

    const entity = event?.payload?.payment?.entity;
    if (!entity?.order_id) return { ignored: true };

    const payment = await Payment.findOne({ gatewayOrderId: entity.order_id });
    if (!payment) return { ignored: true };

    payment.webhookLogs.push({ event: event.event, receivedAt: new Date() });

    if (event.event === 'payment.captured') {
      return this.markPaid(payment, entity.id, signature);
    }
    if (event.event === 'payment.failed' && payment.status === 'CREATED') {
      payment.status = 'FAILED';
      await payment.save();
    }
    return { payment };
  }

  async markPaid(payment, gatewayPaymentId, signature) {
    // Idempotent: checkout callback and webhook can both arrive.
    if (payment.status === 'SUCCESS' || payment.status === 'REFUNDED') {
      return { payment, duplicate: true };
    }

    payment.status = 'SUCCESS';
    payment.gatewayPaymentId = gatewayPaymentId;
    payment.gatewayTransactionId = gatewayPaymentId;
    payment.gatewaySignature = signature || '';
    await payment.save();

    try {
      await bookingService.confirmBooking(payment.bookingId);
    } catch (err) {
      logger.error(`Booking confirmation failed after successful payment: ${err.message}`);
      try {
        await razorpay.processRefund({ gatewayPaymentId, amount: payment.amount });
        payment.status = 'REFUNDED';
        await payment.save();
      } catch (refundErr) {
        logger.error(`Auto-refund failed for ${payment.orderId}: ${refundErr.message}`);
      }
    }

    return { payment, duplicate: false };
  }
}

module.exports = new PaymentService();