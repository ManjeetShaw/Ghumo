const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const { protect } = require('../middleware/auth.middleware');
const idempotencyMiddleware = require('../middleware/idempotency.middleware');

// All booking routes require authentication
router.use(protect);

router.post('/', idempotencyMiddleware(), (req, res, next) =>
  bookingController.createBooking(req, res, next)
);
router.get('/', (req, res, next) => bookingController.getUserBookings(req, res, next));
router.get('/:id', (req, res, next) => bookingController.getBookingById(req, res, next));
router.post('/:id/confirm', (req, res, next) => bookingController.confirmBooking(req, res, next));
router.post('/:id/cancel', (req, res, next) => bookingController.cancelBooking(req, res, next));

module.exports = router;
