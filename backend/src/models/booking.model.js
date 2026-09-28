const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingReference: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      index: true,
    },
    category: {
      type: String,
      enum: ['FLIGHT', 'TRAIN', 'BUS', 'HOTEL'],
      required: [true, 'Booking category is required'],
    },
    providerId: {
      type: String,
      required: [true, 'Provider ID is required'],
    },
    providerBookingRef: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: [
        'INITIATED',
        'PAYMENT_PENDING',
        'PAYMENT_SUCCESS',
        'BOOKING_PENDING',
        'CONFIRMED',
        'TICKET_ISSUED',
        'FAILED',
        'CANCELLATION_PENDING',
        'CANCELLED',
        'REFUND_PENDING',
        'REFUNDED',
      ],
      default: 'INITIATED',
      index: true,
    },
    pricing: {
      baseFare: { type: Number, required: true, min: 0 },
      taxes: { type: Number, required: true, min: 0 },
      providerFee: { type: Number, default: 0, min: 0 },
      serviceFee: { type: Number, required: true, min: 0 },
      discountAmount: { type: Number, default: 0, min: 0 },
      totalAmount: { type: Number, required: true, min: 0 },
      currency: { type: String, default: 'INR', uppercase: true },
    },
    passengers: [
      {
        name: { type: String, required: true },
        age: { type: Number },
        gender: { type: String },
        seatNumber: { type: String, default: '' },
        idProof: { type: String, default: '' },
      },
    ],
    details: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    idempotencyKey: {
      type: String,
      index: true,
      sparse: true,
    },
    cancellationReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
