const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

// Public Auth Routes
router.post('/register', (req, res, next) => authController.register(req, res, next));
router.post('/login', (req, res, next) => authController.login(req, res, next));
router.post('/logout', (req, res, next) => authController.logout(req, res, next));

// Protected User Profile Routes
router.get('/me', protect, (req, res, next) => authController.getMe(req, res, next));
router.get('/profile', protect, (req, res, next) => authController.getMe(req, res, next));
router.patch('/profile', protect, (req, res, next) => authController.updateProfile(req, res, next));

module.exports = router;