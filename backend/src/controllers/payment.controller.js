const paymentService = require('../services/payment.service');
const { successResponse, errorResponse } = require('../utils/apiResponse');

class PaymentController {
  async createPaymentOrder(req, res, next) {
    try {
      const { bookingId } = req.body;
      const order = await paymentService.createPaymentOrder(req.user._id, bookingId);
      return successResponse(res, { order }, 'Payment order created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async verifyPayment(req, res, next) {
    try {
      const { gatewayOrderId, gatewayPaymentId, signature } = req.body;
      if (!gatewayOrderId || !gatewayPaymentId || !signature) {
        return errorResponse(res, 'gatewayOrderId, gatewayPaymentId and signature are required', 400, 'BAD_REQUEST');
      }
      const result = await paymentService.verifyCheckoutPayment(req.user._id, {
        gatewayOrderId,
        gatewayPaymentId,
        signature,
      });
      return successResponse(res, { status: result.payment.status }, 'Payment verified successfully', 200);
    } catch (err) {
      next(err);
    }
  }

  async handleWebhook(req, res, next) {
    try {
      const signature = req.headers['x-razorpay-signature'];
      await paymentService.handleWebhook(req.rawBody, signature, req.body);
      return successResponse(res, {}, 'Webhook processed successfully', 200);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new PaymentController();
