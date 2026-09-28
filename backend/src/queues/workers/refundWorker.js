const { Worker } = require('bullmq');
const { redisConnection } = require('../queue.config');
const razorpay = require('../../providers/adapters/RazorpayProvider');
const Booking = require('../../models/booking.model');
const Payment = require('../../models/payment.model');
const bookingStateMachine = require('../../services/bookingStateMachine');
const logger = require('../../utils/logger');

const refundWorker = new Worker(
  'refundQueue',
  async (job) => {
    const { bookingId, orderId, amount, reason } = job.data;
    logger.info(`[Refund Worker] Processing refund for order ${orderId} (Amount: ₹${amount})`);

    const payment = await Payment.findOne({ orderId });
    if (!payment || !payment.gatewayPaymentId) {
      throw new Error(`No captured gateway payment found for order ${orderId}; cannot refund`);
    }
    const refundResult = await razorpay.processRefund({ gatewayPaymentId: payment.gatewayPaymentId, amount });

    if (bookingId) {
      const booking = await Booking.findById(bookingId);
      if (booking && booking.status === 'REFUND_PENDING') {
        await bookingStateMachine.transition(booking, 'REFUNDED', reason);
      }
    }

    if (orderId) {
      await Payment.findOneAndUpdate({ orderId }, { status: 'REFUNDED' });
    }

    return {
      success: true,
      refundId: refundResult.refundId,
      orderId,
      amount,
      processedAt: new Date().toISOString(),
    };
  },
  { connection: redisConnection }
);

refundWorker.on('completed', (job, result) => {
  logger.info(`[Refund Worker] Job ${job.id} completed: Refund ${result.refundId} issued for ₹${result.amount}`);
});

refundWorker.on('failed', (job, err) => {
  logger.error(`[Refund Worker] Job ${job?.id} failed: ${err.message}`);
});

module.exports = refundWorker;
