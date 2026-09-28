const aiService = require('../services/ai.service');
const { successResponse, errorResponse } = require('../utils/apiResponse');

class AIController {
  async parseNaturalLanguageSearch(req, res, next) {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return errorResponse(res, 'Prompt is required for natural language travel search', 400, 'BAD_REQUEST');
      }

      const searchResult = await aiService.parseNaturalLanguageSearch(prompt);
      return successResponse(res, searchResult, 'Natural language search parsed successfully');
    } catch (error) {
      next(error);
    }
  }

  async generateItinerary(req, res, next) {
    try {
      const userId = req.user ? req.user._id : null;
      const { destination, days, budget, title } = req.body;

      const itinerary = await aiService.generateItinerary(userId, {
        destination,
        days: days ? parseInt(days, 10) : undefined,
        budget: budget ? parseFloat(budget) : undefined,
        title,
      });

      return successResponse(res, itinerary, 'Itinerary generated successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AIController();
