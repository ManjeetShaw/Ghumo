const Trip = require('../models/trip.model');

class TripService {
  async createTrip(userId, tripData) {
    const trip = new Trip({
      ...tripData,
      userId,
    });

    trip.recalculateBudget();
    await trip.save();
    return trip;
  }

  async getUserTrips(userId, query = {}) {
    const { status, limit = 20, page = 1 } = query;
    const filter = { userId };

    if (status) {
      filter.status = status;
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const [trips, total] = await Promise.all([
      Trip.find(filter)
        .sort({ startDate: 1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10)),
      Trip.countDocuments(filter),
    ]);

    return {
      trips,
      pagination: {
        total,
        page: parseInt(page, 10),
        pages: Math.ceil(total / parseInt(limit, 10)),
      },
    };
  }

  async getTripById(userId, tripId) {
    const trip = await Trip.findById(tripId);
    if (!trip) {
      const error = new Error('Trip not found');
      error.statusCode = 404;
      error.errorCode = 'NOT_FOUND';
      throw error;
    }

    // Security Check: User A cannot access User B's trip
    if (trip.userId.toString() !== userId.toString()) {
      const error = new Error('You do not have permission to access this trip');
      error.statusCode = 403;
      error.errorCode = 'FORBIDDEN';
      throw error;
    }

    return trip;
  }

  async updateTrip(userId, tripId, updateData) {
    const trip = await this.getTripById(userId, tripId);

    // Prevent overwriting userId or itinerary directly via simple patch
    delete updateData.userId;
    delete updateData._id;

    Object.assign(trip, updateData);
    trip.recalculateBudget();
    await trip.save();
    return trip;
  }

  async deleteTrip(userId, tripId) {
    const trip = await this.getTripById(userId, tripId);
    await Trip.findByIdAndDelete(trip._id);
    return { id: tripId };
  }

  async addItineraryItem(userId, tripId, itemData) {
    const trip = await this.getTripById(userId, tripId);
    trip.itinerary.push(itemData);
    trip.recalculateBudget();
    await trip.save();
    return trip;
  }

  async deleteItineraryItem(userId, tripId, itemId) {
    const trip = await this.getTripById(userId, tripId);
    const initialCount = trip.itinerary.length;
    trip.itinerary = trip.itinerary.filter((item) => item._id.toString() !== itemId.toString());

    if (trip.itinerary.length === initialCount) {
      const error = new Error('Itinerary item not found');
      error.statusCode = 404;
      error.errorCode = 'NOT_FOUND';
      throw error;
    }

    trip.recalculateBudget();
    await trip.save();
    return trip;
  }
}

module.exports = new TripService();
