const mongoose = require('mongoose');
const config = require('./index');
const logger = require('../utils/logger');

let isConnected = false;
let mongoMemoryServer = null;

async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  let dbUrl = config.databaseUrl;

  if (config.env === 'test') {
    try {
      const conn = await mongoose.connect(dbUrl, {
        serverSelectionTimeoutMS: 2000,
      });
      isConnected = conn.connections[0].readyState === 1;
      logger.info(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
      return conn.connection;
    } catch (err) {
      logger.info('Local MongoDB unreachable in test environment. Starting MongoMemoryServer fallback...');
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongoMemoryServer = await MongoMemoryServer.create();
        dbUrl = mongoMemoryServer.getUri();
      } catch (memErr) {
        logger.error(`MongoMemoryServer failed: ${memErr.message}`);
        throw err;
      }
    }
  }

  try {
    const conn = await mongoose.connect(dbUrl, {
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = conn.connections[0].readyState === 1;
    logger.info(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);

    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB connection error: ${err.message}`);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
      isConnected = false;
    });

    return conn.connection;
  } catch (err) {
    logger.error(`Failed to connect to MongoDB: ${err.message}`);
    isConnected = false;
    throw err;
  }
}

async function closeDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    isConnected = false;
    logger.info('MongoDB connection closed.');
  }
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
    mongoMemoryServer = null;
    logger.info('MongoMemoryServer stopped.');
  }
}

function getDBStatus() {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  return {
    state: states[mongoose.connection.readyState] || 'unknown',
    isConnected: mongoose.connection.readyState === 1,
  };
}

module.exports = {
  connectDB,
  closeDB,
  getDBStatus,
};
