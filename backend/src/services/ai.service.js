const searchService = require('./search.service');
const tripService = require('./trip.service');
const logger = require('../utils/logger');
const { generateText } = require('../utils/geminiClient');

function unavailable(err) {
  const busy = /quota|429|RESOURCE_EXHAUSTED/i.test(err.message);
  const error = new Error(
    busy
      ? 'The AI is busy right now (free-tier limit). Please wait about a minute and try again.'
      : `AI service is unavailable: ${err.message}`
  );
  error.statusCode = busy ? 429 : 503;
  error.errorCode = busy ? 'AI_BUSY' : 'AI_UNAVAILABLE';
  return error;
}

class AIService {
  /**
   * Parse a natural-language travel query into search filters (Gemini), then
   * run the search against the live provider adapters.
   * Gemini never produces prices or inventory - those come only from providers.
   */
  async parseNaturalLanguageSearch(prompt) {
    if (!prompt || typeof prompt !== 'string') {
      throw new Error('Prompt is required for natural language travel search');
    }

    logger.info(`[AI Service] Parsing search prompt: "${prompt}"`);

    let intent;
    let intentSource = 'gemini';
    try {
      intent = await this.extractIntentWithGemini(prompt);
    } catch (err) {
      // Only the prompt -> filters step degrades; results still come from providers.
      logger.warn(`[AI Service] Gemini intent extraction failed (${err.message}); using keyword parser`);
      intent = this.extractSearchIntentFromPrompt(prompt);
      intentSource = 'rules';
    }

    let results = {};
    if (intent.category === 'FLIGHT') {
      results = { flights: await searchService.searchFlights(intent) };
    } else if (intent.category === 'TRAIN') {
      results = { trains: await searchService.searchTrains(intent) };
    } else if (intent.category === 'BUS') {
      results = { buses: await searchService.searchBuses(intent) };
    } else if (intent.category === 'HOTEL') {
      results = { hotels: await searchService.searchHotels(intent) };
    } else {
      const all = await searchService.searchAll(intent);
      results = all.results;
    }

    return { prompt, intent, intentSource, results };
  }

  async extractIntentWithGemini(prompt) {
    const today = new Date().toISOString().slice(0, 10);
    const raw = await generateText({
      temperature: 0.1,
      prompt:
        `You convert a traveller's request into search filters for an Indian travel app.\n` +
        `Today's date is ${today}. Resolve relative dates ("tomorrow", "next Friday") to YYYY-MM-DD.\n` +
        `Use 3-letter IATA city codes for origin/destination (Kolkata=CCU, Delhi=DEL, Mumbai=BOM, Bengaluru=BLR, Kochi=COK, Jaipur=JAI).\n` +
        `"city" is the destination city name used for hotel searches.\n` +
        `category is FLIGHT, TRAIN, BUS or HOTEL if the traveller clearly wants one, otherwise ALL.\n` +
        `maxPrice is a number in INR. Leave a field null when it is not stated.\n\n` +
        `Request: ${JSON.stringify(prompt)}`,
      responseSchema: {
        type: 'OBJECT',
        properties: {
          category: { type: 'STRING', enum: ['FLIGHT', 'TRAIN', 'BUS', 'HOTEL', 'ALL'] },
          origin: { type: 'STRING', nullable: true },
          destination: { type: 'STRING', nullable: true },
          city: { type: 'STRING', nullable: true },
          date: { type: 'STRING', nullable: true },
          maxPrice: { type: 'NUMBER', nullable: true },
          sortBy: { type: 'STRING', enum: ['price_asc', 'price_desc', 'duration_asc', 'rating_desc'] },
        },
        required: ['category', 'sortBy'],
      },
    });

    const parsed = JSON.parse(raw);
    const clean = {};
    Object.entries(parsed).forEach(([k, v]) => {
      if (v !== null && v !== '') clean[k] = v;
    });
    return clean;
  }

  /** Keyword-based fallback parser (used only if the Gemini call fails). */
  extractSearchIntentFromPrompt(prompt) {
    const text = prompt.toLowerCase();

    let category = 'ALL';
    if (text.includes('flight') || text.includes('fly') || text.includes('plane') || text.includes('airline')) {
      category = 'FLIGHT';
    } else if (text.includes('train') || text.includes('rail') || text.includes('irctc') || text.includes('shatabdi') || text.includes('express')) {
      category = 'TRAIN';
    } else if (text.includes('bus') || text.includes('sleeper')) {
      category = 'BUS';
    } else if (text.includes('hotel') || text.includes('stay') || text.includes('resort') || text.includes('room')) {
      category = 'HOTEL';
    }

    const cities = {
      kolkata: ['CCU', 'Kolkata'], delhi: ['DEL', 'Delhi'], mumbai: ['BOM', 'Mumbai'],
      bengaluru: ['BLR', 'Bengaluru'], bangalore: ['BLR', 'Bengaluru'], kochi: ['COK', 'Kochi'],
      jaipur: ['JAI', 'Jaipur'], agra: ['AGC', 'Agra'], chennai: ['MAA', 'Chennai'], hyderabad: ['HYD', 'Hyderabad'],
    };
    const intent = { category, sortBy: 'price_asc' };
    for (const [name, [code, label]] of Object.entries(cities)) {
      if (text.includes(`from ${name}`)) intent.origin = code;
      if (text.includes(`to ${name}`) || text.includes(`in ${name}`)) {
        intent.destination = code;
        intent.city = label;
      }
    }

    const priceMatch = text.match(/(?:under|below|less than|budget of)\s*(?:₹|rs\.?|inr)?\s*(\d{3,6})/);
    if (priceMatch) intent.maxPrice = parseInt(priceMatch[1], 10);
    return intent;
  }

  /**
   * Generate a day-by-day itinerary with Gemini and, for signed-in users,
   * save it as a Trip.
   */
  async generateItinerary(userId, { destination = 'Jaipur', days = 3, budget = 20000, title }) {
    logger.info(`[AI Service] Generating ${days}-day itinerary for ${destination} (Budget: ₹${budget})`);

    const tripTitle = title || `${days}-Day AI Tour of ${destination}`;

    let raw;
    try {
      raw = await generateText({
        temperature: 0.7,
        prompt:
          `Plan a ${days}-day trip to ${destination}, India for a total budget of INR ${budget}.\n` +
          `Give 3 to 5 activities per day in chronological order, mixing sightseeing, food and local experiences.\n` +
          `Each activity needs a start time like "09:30 AM", a realistic estimated cost in INR per traveller (0 if free) ` +
          `and a one-sentence note. type is ACTIVITY or RESTAURANT. Keep the total of all estimated costs within the budget.`,
        responseSchema: {
          type: 'OBJECT',
          properties: {
            days: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  day: { type: 'INTEGER' },
                  title: { type: 'STRING' },
                  activities: {
                    type: 'ARRAY',
                    items: {
                      type: 'OBJECT',
                      properties: {
                        type: { type: 'STRING', enum: ['ACTIVITY', 'RESTAURANT'] },
                        title: { type: 'STRING' },
                        time: { type: 'STRING' },
                        estimatedCost: { type: 'NUMBER' },
                        notes: { type: 'STRING' },
                      },
                      required: ['type', 'title', 'time', 'estimatedCost'],
                    },
                  },
                },
                required: ['day', 'title', 'activities'],
              },
            },
          },
          required: ['days'],
        },
      });
    } catch (err) {
      throw unavailable(err);
    }

    const generatedDays = (JSON.parse(raw).days || []).map((d) => {
      const activities = (d.activities || []).map((a) => ({
        type: a.type === 'RESTAURANT' ? 'RESTAURANT' : 'ACTIVITY',
        title: a.title,
        time: a.time,
        estimatedCost: Math.max(0, Math.round(Number(a.estimatedCost) || 0)),
        notes: a.notes || '',
      }));
      return {
        day: d.day,
        title: d.title,
        activities,
        estimatedCost: activities.reduce((sum, a) => sum + a.estimatedCost, 0),
      };
    });

    const estimatedTotal = generatedDays.reduce((acc, d) => acc + d.estimatedCost, 0);

    let savedTrip = null;
    if (userId) {
      const startDate = new Date();
      const endDate = new Date(Date.now() + days * 86400000);

      const itineraryItems = [];
      generatedDays.forEach((d) => {
        d.activities.forEach((act) => {
          itineraryItems.push({
            type: act.type,
            title: act.title,
            date: new Date(startDate.getTime() + (d.day - 1) * 86400000),
            startTime: act.time,
            estimatedCost: act.estimatedCost,
            notes: act.notes,
          });
        });
      });

      savedTrip = await tripService.createTrip(userId, {
        title: tripTitle,
        description: `AI generated ${days}-day travel plan for ${destination}`,
        startDate,
        endDate,
        destinations: [{ city: destination, country: 'India' }],
        budget: { totalBudget: budget, currency: 'INR' },
        itinerary: itineraryItems,
      });
    }

    return {
      destination,
      daysCount: days,
      budgetLimit: budget,
      estimatedTotal,
      days: generatedDays,
      trip: savedTrip,
    };
  }
}

module.exports = new AIService();