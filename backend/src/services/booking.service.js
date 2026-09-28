const Booking = require('../models/booking.model');
const bookingStateMachine = require('./bookingStateMachine');
const pricingService = require('./pricing.service');
const providerRegistry = require('../providers/ProviderRegistry');

class BookingService {
  async createBookingIntent(userId, bookingData, idempotencyKey = null) {
    const { category, providerId, details, passengers = [], couponCode, tripId } = bookingData;

    if (!category || !providerId || !details) {
      const error = new Error('Category, providerId, and details are required');
      error.statusCode = 400;
      error.errorCode = 'VALIDATION_ERROR';
      throw error;
    }

    // Extract item base fare from normalized details payload
    const itemPrice = details.price?.base || details.fare || details.roomTypes?.[0]?.farePerNight || 0;

    // Server-side fare validation & quote calculation
    const pricing = pricingService.calculateFare({
      category,
      baseFare: itemPrice,
      couponCode,
    });

    // Generate unique Booking Reference: TRV-YYYY-XXXXX
    const year = new Date().getFullYear();
    const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
    const bookingReference = `TRV-${year}-${randomHex}`;

    const booking = new Booking({
      bookingReference,
      userId,
      tripId: tripId || null,
      category: category.toUpperCase(),
      providerId,
      status: 'INITIATED',
      pricing,
      passengers,
      details,
      idempotencyKey,
    });

    await booking.save();

    // Transition state from INITIATED to PAYMENT_PENDING
    await bookingStateMachine.transition(booking, 'PAYMENT_PENDING');

    return booking;
  }

  async confirmBooking(bookingId) {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      const error = new Error('Booking not found');
      error.statusCode = 404;
      error.errorCode = 'NOT_FOUND';
      throw error;
    }

    // Must be in PAYMENT_SUCCESS or PAYMENT_PENDING state to confirm
    if (booking.status === 'PAYMENT_PENDING') {
      await bookingStateMachine.transition(booking, 'PAYMENT_SUCCESS');
    }

    await bookingStateMachine.transition(booking, 'BOOKING_PENDING');

    try {
      // Execute reservation via Provider Adapter
      const adapter = providerRegistry.getAdapter(booking.providerId);
      const reservationResult = await adapter.createReservation({
        bookingRef: booking.bookingReference,
        passengers: booking.passengers,
        details: booking.details,
      });

      if (reservationResult.success) {
        booking.providerBookingRef = reservationResult.providerBookingRef || '';
        await bookingStateMachine.transition(booking, 'CONFIRMED');
        await bookingStateMachine.transition(booking, 'TICKET_ISSUED');
      } else {
        await bookingStateMachine.transition(booking, 'FAILED', 'Provider reservation failed');
      }
    } catch (err) {
      await bookingStateMachine.transition(booking, 'FAILED', err.message);
      throw err;
    }

    return booking;
  }

  async cancelBooking(userId, bookingId, reason = 'User requested cancellation') {
    const booking = await this.getBookingById(userId, bookingId);

    // Initiate cancellation transition
    await bookingStateMachine.transition(booking, 'CANCELLATION_PENDING', reason);

    try {
      if (booking.providerBookingRef) {
        const adapter = providerRegistry.getAdapter(booking.providerId);
        await adapter.cancelReservation(booking.providerBookingRef);
      }
    } catch (err) {
      // Log provider cancellation error, proceed with internal cancellation
    }

    await bookingStateMachine.transition(booking, 'REFUND_PENDING', reason);

    return booking;
  }

  async getBookingById(userId, bookingId) {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      const error = new Error('Booking not found');
      error.statusCode = 404;
      error.errorCode = 'NOT_FOUND';
      throw error;
    }

    if (booking.userId.toString() !== userId.toString()) {
      const error = new Error('You do not have permission to access this booking');
      error.statusCode = 403;
      error.errorCode = 'FORBIDDEN';
      throw error;
    }

    return booking;
  }

  async getUserBookings(userId, query = {}) {
    const { status, category, limit = 20, page = 1 } = query;
    const filter = { userId };

    if (status) filter.status = status;
    if (category) filter.category = category.toUpperCase();

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10)),
      Booking.countDocuments(filter),
    ]);

    return {
      bookings,
      pagination: {
        total,
        page: parseInt(page, 10),
        pages: Math.ceil(total / parseInt(limit, 10)),
      },
    };
  }
}

module.exports = new BookingService();
