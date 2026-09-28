const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    passwordHash: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ['USER', 'ADMIN', 'SUPPORT'],
        message: 'Role must be either USER, ADMIN, or SUPPORT',
      },
      default: 'USER',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    profileImage: {
      type: String,
      default: '',
    },
    preferences: {
      currency: {
        type: String,
        default: 'INR',
        uppercase: true,
      },
      language: {
        type: String,
        default: 'en',
      },
      seatPreference: {
        type: String,
        enum: ['window', 'aisle', 'no_preference'],
        default: 'no_preference',
      },
      mealPreference: {
        type: String,
        enum: ['veg', 'non_veg', 'vegan', 'no_preference'],
        default: 'no_preference',
      },
      budgetPreference: {
        type: String,
        enum: ['economy', 'mid_range', 'luxury'],
        default: 'mid_range',
      },
    },
    passportDetails: {
      passportNumber: { type: String, default: '' },
      expiryDate: { type: Date },
      issuingCountry: { type: String, default: '' },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

// Compare entered password with hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

// Remove passwordHash from JSON representations
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.passwordHash;
  return userObject;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
