const express = require('express');
const router = express.Router();
const searchController = require('../controllers/search.controller');

// Search Endpoints (Public access for discovery)
router.get('/flights/search', (req, res, next) => searchController.searchFlights(req, res, next));
router.get('/trains/search', (req, res, next) => searchController.searchTrains(req, res, next));
router.get('/buses/search', (req, res, next) => searchController.searchBuses(req, res, next));
router.get('/hotels/search', (req, res, next) => searchController.searchHotels(req, res, next));
router.get('/search/all', (req, res, next) => searchController.searchAll(req, res, next));

// Pricing Verification Endpoint
router.post('/pricing/quote', (req, res, next) => searchController.getPriceQuote(req, res, next));

module.exports = router;
