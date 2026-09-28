const User = require('../models/user.model');
const { generateToken } = require('../utils/jwt');

class AuthService {
  async register({ name, email, password, role = 'USER', phone = '', preferences = {} }) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error('User with this email already exists');
      error.statusCode = 400;
      error.errorCode = 'DUPLICATE_ERROR';
      throw error;
    }

    const user = await User.create({
      name,
      email,
      passwordHash: password,
      role,
      phone,
      preferences,
    });

    const token = generateToken({ id: user._id, role: user.role, email: user.email });

    return {
      user: user.toJSON(),
      token,
    };
  }

  async login({ email, password }) {
    if (!email || !password) {
      const error = new Error('Please provide email and password');
      error.statusCode = 400;
      error.errorCode = 'VALIDATION_ERROR';
      throw error;
    }

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user || !(await user.comparePassword(password))) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      error.errorCode = 'INVALID_CREDENTIALS';
      throw error;
    }

    if (!user.isActive) {
      const error = new Error('User account is deactivated');
      error.statusCode = 403;
      error.errorCode = 'ACCOUNT_DEACTIVATED';
      throw error;
    }

    const token = generateToken({ id: user._id, role: user.role, email: user.email });

    return {
      user: user.toJSON(),
      token,
    };
  }

  async getUserProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      error.errorCode = 'NOT_FOUND';
      throw error;
    }
    return user.toJSON();
  }

  async updateUserProfile(userId, updateData) {
    // Prevent sensitive fields from being updated directly via profile patch
    const allowedFields = ['name', 'phone', 'profileImage', 'preferences', 'passportDetails'];
    const filteredUpdates = {};

    Object.keys(updateData).forEach((key) => {
      if (allowedFields.includes(key)) {
        filteredUpdates[key] = updateData[key];
      }
    });

    const user = await User.findByIdAndUpdate(userId, filteredUpdates, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      error.errorCode = 'NOT_FOUND';
      throw error;
    }

    return user.toJSON();
  }
}

module.exports = new AuthService();
