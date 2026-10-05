const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { protect } = require('../middleware/auth.middleware');

// Razorpay server-to-server webhook (authenticated via X-Razorpay-Signature over the raw body)
router.post('/webhook', (req, res, next) => paymentController.handleWebhook(req, res, next));

// Protected payment operations
router.post('/create-order', protect, (req, res, next) =>
  paymentController.createPaymentOrder(req, res, next)
);
router.post('/verify', protect, (req, res, next) =>
  paymentController.verifyPayment(req, res, next)
);

module.exports = router;