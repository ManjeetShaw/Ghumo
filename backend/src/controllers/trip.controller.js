const tripService = require('../services/trip.service');
const { successResponse } = require('../utils/apiResponse');

class TripController {
  async createTrip(req, res, next) {
    try {
      const trip = await tripService.createTrip(req.user._id, req.body);
      return successResponse(res, { trip }, 'Trip created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async getUserTrips(req, res, next) {
    try {
      const result = await tripService.getUserTrips(req.user._id, req.query);
      return successResponse(res, result, 'Trips retrieved successfully', 200);
    } catch (err) {
      next(err);
    }
  }

  async getTripById(req, res, next) {
    try {
      const trip = await tripService.getTripById(req.user._id, req.params.id);
      return successResponse(res, { trip }, 'Trip retrieved successfully', 200);
    } catch (err) {
      next(err);
    }
  }

  async updateTrip(req, res, next) {
    try {
      const trip = await tripService.updateTrip(req.user._id, req.params.id, req.body);
      return successResponse(res, { trip }, 'Trip updated successfully', 200);
    } catch (err) {
      next(err);
    }
  }

  async deleteTrip(req, res, next) {
    try {
      const result = await tripService.deleteTrip(req.user._id, req.params.id);
      return successResponse(res, result, 'Trip deleted successfully', 200);
    } catch (err) {
      next(err);
    }
  }

  async addItineraryItem(req, res, next) {
    try {
      const trip = await tripService.addItineraryItem(req.user._id, req.params.id, req.body);
      return successResponse(res, { trip }, 'Itinerary item added successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async deleteItineraryItem(req, res, next) {
    try {
      const trip = await tripService.deleteItineraryItem(
        req.user._id,
        req.params.id,
        req.params.itemId
      );
      return successResponse(res, { trip }, 'Itinerary item deleted successfully', 200);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new TripController();
