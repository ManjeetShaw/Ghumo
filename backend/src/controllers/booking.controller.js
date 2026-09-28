const bookingService = require('../services/booking.service');
const { successResponse } = require('../utils/apiResponse');

class BookingController {
  async createBooking(req, res, next) {
    try {
      const booking = await bookingService.createBookingIntent(
        req.user._id,
        req.body,
        req.idempotencyKey
      );
      return successResponse(res, { booking }, 'Booking intent created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async confirmBooking(req, res, next) {
    try {
      const booking = await bookingService.confirmBooking(req.params.id);
      return successResponse(res, { booking }, 'Booking confirmed successfully', 200);
    } catch (err) {
      next(err);
    }
  }

  async cancelBooking(req, res, next) {
    try {
      const { reason } = req.body;
      const booking = await bookingService.cancelBooking(req.user._id, req.params.id, reason);
      return successResponse(res, { booking }, 'Booking cancelled successfully', 200);
    } catch (err) {
      next(err);
    }
  }

  async getBookingById(req, res, next) {
    try {
      const booking = await bookingService.getBookingById(req.user._id, req.params.id);
      return successResponse(res, { booking }, 'Booking retrieved successfully', 200);
    } catch (err) {
      next(err);
    }
  }

  async getUserBookings(req, res, next) {
    try {
      const result = await bookingService.getUserBookings(req.user._id, req.query);
      return successResponse(res, result, 'User bookings retrieved successfully', 200);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new BookingController();
