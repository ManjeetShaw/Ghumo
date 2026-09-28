const authService = require('../services/auth.service');
const { successResponse } = require('../utils/apiResponse');

class AuthController {
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      return successResponse(res, result, 'User registered successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);
      return successResponse(res, result, 'Login successful', 200);
    } catch (err) {
      next(err);
    }
  }

  async getMe(req, res, next) {
    try {
      const user = await authService.getUserProfile(req.user._id);
      return successResponse(res, { user }, 'User profile retrieved successfully', 200);
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const updatedUser = await authService.updateUserProfile(req.user._id, req.body);
      return successResponse(res, { user: updatedUser }, 'User profile updated successfully', 200);
    } catch (err) {
      next(err);
    }
  }

  async logout(req, res, next) {
    // Statistically stateless JWT logout (Client side drops token)
    return successResponse(res, null, 'Logged out successfully', 200);
  }
}

module.exports = new AuthController();
