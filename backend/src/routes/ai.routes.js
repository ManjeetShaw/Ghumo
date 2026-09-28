const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const { authenticateToken, optionalAuth } = require('../middleware/auth.middleware');

// Public or optional auth for NL travel search
router.post('/travel-search', optionalAuth, (req, res, next) => aiController.parseNaturalLanguageSearch(req, res, next));

// Optional auth for generating itinerary (saves to user account if authenticated)
router.post('/itinerary', optionalAuth, (req, res, next) => aiController.generateItinerary(req, res, next));

module.exports = router;
