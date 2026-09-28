/**
 * Booking State Machine Engine
 * Strictly enforces valid life-cycle transitions for bookings.
 */

const ALLOWED_TRANSITIONS = {
  INITIATED: ['PAYMENT_PENDING', 'CANCELLED', 'FAILED'],
  PAYMENT_PENDING: ['PAYMENT_SUCCESS', 'FAILED', 'CANCELLED'],
  PAYMENT_SUCCESS: ['BOOKING_PENDING', 'CONFIRMED', 'CANCELLATION_PENDING', 'FAILED'],
  BOOKING_PENDING: ['CONFIRMED', 'TICKET_ISSUED', 'CANCELLATION_PENDING', 'FAILED'],
  CONFIRMED: ['TICKET_ISSUED', 'CANCELLATION_PENDING', 'CANCELLED'],
  TICKET_ISSUED: ['CANCELLATION_PENDING', 'CANCELLED'],
  CANCELLATION_PENDING: ['CANCELLED', 'REFUND_PENDING', 'FAILED'],
  REFUND_PENDING: ['REFUNDED', 'CANCELLED', 'FAILED'],
  // Terminal states (unless explicit retry allowed)
  CANCELLED: ['REFUND_PENDING'],
  REFUNDED: [],
  FAILED: ['INITIATED', 'PAYMENT_PENDING'],
};

class BookingStateMachine {
  canTransition(currentState, targetState) {
    if (!ALLOWED_TRANSITIONS[currentState]) {
      return false;
    }
    return ALLOWED_TRANSITIONS[currentState].includes(targetState);
  }

  async transition(booking, targetState, reason = '') {
    const currentState = booking.status;

    if (currentState === targetState) {
      return booking; // Idempotent no-op
    }

    if (!this.canTransition(currentState, targetState)) {
      const error = new Error(
        `Invalid booking state transition from '${currentState}' to '${targetState}'`
      );
      error.statusCode = 400;
      error.errorCode = 'INVALID_STATE_TRANSITION';
      throw error;
    }

    booking.status = targetState;
    if (reason) {
      booking.cancellationReason = reason;
    }

    await booking.save();
    return booking;
  }
}

module.exports = new BookingStateMachine();
