const mongoose = require('mongoose');

const itineraryItemSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['FLIGHT', 'TRAIN', 'BUS', 'HOTEL', 'ACTIVITY', 'RESTAURANT', 'CUSTOM'],
      required: [true, 'Itinerary item type is required'],
    },
    title: {
      type: String,
      required: [true, 'Itinerary item title is required'],
      trim: true,
    },
    date: {
      type: Date,
    },
    startTime: {
      type: String,
      default: '',
    },
    endTime: {
      type: String,
      default: '',
    },
    location: {
      name: { type: String, default: '' },
      address: { type: String, default: '' },
      coordinates: {
        lat: { type: Number, default: 0 },
        lng: { type: Number, default: 0 },
      },
    },
    estimatedCost: {
      type: Number,
      default: 0,
      min: [0, 'Estimated cost cannot be negative'],
    },
    actualCost: {
      type: Number,
      default: 0,
      min: [0, 'Actual cost cannot be negative'],
    },
    bookingRef: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['PLANNED', 'BOOKED', 'COMPLETED'],
      default: 'PLANNED',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { _id: true, timestamps: true }
);

const destinationSchema = new mongoose.Schema(
  {
    city: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    arrivalDate: { type: Date },
    departureDate: { type: Date },
  },
  { _id: true }
);

const tripSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a trip title'],
      trim: true,
      maxlength: [120, 'Trip title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['DRAFT', 'PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED'],
      default: 'PLANNED',
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    destinations: [destinationSchema],
    budget: {
      totalBudget: { type: Number, default: 0, min: 0 },
      transportBudget: { type: Number, default: 0, min: 0 },
      hotelBudget: { type: Number, default: 0, min: 0 },
      activityBudget: { type: Number, default: 0, min: 0 },
      allocated: { type: Number, default: 0, min: 0 },
      spent: { type: Number, default: 0, min: 0 },
      currency: { type: String, default: 'INR', uppercase: true },
    },
    itinerary: [itineraryItemSchema],
  },
  {
    timestamps: true,
  }
);

// Method to recalculate budget totals
tripSchema.methods.recalculateBudget = function () {
  let totalAllocated = 0;
  let totalSpent = 0;

  this.itinerary.forEach((item) => {
    totalAllocated += item.estimatedCost || 0;
    totalSpent += item.actualCost || 0;
  });

  this.budget.allocated = totalAllocated;
  this.budget.spent = totalSpent;
};

const Trip = mongoose.model('Trip', tripSchema);

module.exports = Trip;
