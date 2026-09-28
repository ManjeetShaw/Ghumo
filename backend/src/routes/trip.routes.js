const express = require('express');
const router = express.Router();
const tripController = require('../controllers/trip.controller');
const { protect } = require('../middleware/auth.middleware');

// All trip routes require authentication
router.use(protect);

router.post('/', (req, res, next) => tripController.createTrip(req, res, next));
router.get('/', (req, res, next) => tripController.getUserTrips(req, res, next));
router.get('/:id', (req, res, next) => tripController.getTripById(req, res, next));
router.patch('/:id', (req, res, next) => tripController.updateTrip(req, res, next));
router.delete('/:id', (req, res, next) => tripController.deleteTrip(req, res, next));

// Itinerary item sub-resource routes
router.post('/:id/itinerary', (req, res, next) => tripController.addItineraryItem(req, res, next));
router.delete('/:id/itinerary/:itemId', (req, res, next) =>
  tripController.deleteItineraryItem(req, res, next)
);

module.exports = router;
