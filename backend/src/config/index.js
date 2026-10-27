const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  databaseUrl: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/travel_superapp',
  redisUrl: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  jwtSecret: process.env.JWT_SECRET || 'dev_jwt_secret_key_change_in_prod',
  // Comma separated list of browser origins allowed to call the API, for example https://ghumo.example
  corsOrigins: (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  textModel: process.env.GEMINI_MODEL || 'gemini-3.6-flash',

  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || '',
    keySecret: process.env.RAZORPAY_KEY_SECRET || '',
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
  },
  providers: {
    flightKey: process.env.FLIGHT_PROVIDER_KEY || 'mock',
    trainKey: process.env.TRAIN_PROVIDER_KEY || 'mock',
    busKey: process.env.BUS_PROVIDER_KEY || 'mock',
    hotelKey: process.env.HOTEL_PROVIDER_KEY || 'mock',
  },
  railRadar: {
    apiKey: process.env.RAILRADAR_API_KEY || '',
    baseUrl: 'https://api.railradar.in/v1',
  },
  aviationStack: {
    apiKey: process.env.AVIATIONSTACK_API_KEY || '',
    // Free-tier Aviationstack keys only work over plain HTTP (HTTPS needs a paid
    // plan). Set AVIATIONSTACK_BASE_URL to an https address once you upgrade.
    baseUrl: process.env.AVIATIONSTACK_BASE_URL || 'http://api.aviationstack.com/v1',
  }
};

if (config.env === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be set when NODE_ENV is production');
}

module.exports = config;