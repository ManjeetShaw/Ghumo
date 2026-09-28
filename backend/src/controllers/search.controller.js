const searchService = require('../services/search.service');
const pricingService = require('../services/pricing.service');
const { successResponse } = require('../utils/apiResponse');

class SearchController {
  async searchFlights(req, res, next) {
    try {
      const flights = await searchService.searchFlights(req.query);
      return successResponse(res, { flights, count: flights.length }, 'Flight search completed', 200);
    } catch (err) {
      next(err);
    }
  }

  async searchTrains(req, res, next) {
    try {
      const trains = await searchService.searchTrains(req.query);
      return successResponse(res, { trains, count: trains.length }, 'Train search completed', 200);
    } catch (err) {
      next(err);
    }
  }

  async searchBuses(req, res, next) {
    try {
      const buses = await searchService.searchBuses(req.query);
      return successResponse(res, { buses, count: buses.length }, 'Bus search completed', 200);
    } catch (err) {
      next(err);
    }
  }

  async searchHotels(req, res, next) {
    try {
      const hotels = await searchService.searchHotels(req.query);
      return successResponse(res, { hotels, count: hotels.length }, 'Hotel search completed', 200);
    } catch (err) {
      next(err);
    }
  }

  async searchAll(req, res, next) {
    try {
      const result = await searchService.searchAll(req.query);
      return successResponse(res, result, 'Multimodal search completed', 200);
    } catch (err) {
      next(err);
    }
  }

  async getPriceQuote(req, res, next) {
    try {
      const { category, baseFare, providerFee, couponCode } = req.body;
      const quote = pricingService.calculateFare({ category, baseFare, providerFee, couponCode });
      return successResponse(res, { quote }, 'Pricing quote calculated', 200);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new SearchController();
