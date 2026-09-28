const Redis = require('ioredis');
const config = require('./index');
const logger = require('../utils/logger');

let redisClient = null;

function getRedisClient() {
  if (!redisClient) {
    if (config.env === 'test') {
      try {
        const RedisMock = require('ioredis-mock');
        redisClient = new RedisMock();
        logger.info('Using ioredis-mock for test environment');
        return redisClient;
      } catch (e) {
        logger.warn('ioredis-mock not installed, falling back to ioredis');
      }
    }

    redisClient = new Redis(config.redisUrl, {
      maxRetriesPerRequest: null, // Required for BullMQ
      enableReadyCheck: true,
      retryStrategy(times) {
        if (config.env === 'test' && times > 2) return null;
        const delay = Math.min(times * 200, 3000);
        return delay;
      },
    });

    redisClient.on('connect', () => {
      logger.info('Redis client connecting...');
    });

    redisClient.on('ready', () => {
      logger.info('Redis connection established and ready');
    });

    redisClient.on('error', (err) => {
      logger.error(`Redis connection error: ${err.message}`);
    });

    redisClient.on('close', () => {
      logger.warn('Redis connection closed');
    });
  }

  return redisClient;
}

async function checkRedisHealth() {
  try {
    const client = getRedisClient();
    const pingResponse = await client.ping();
    return {
      status: pingResponse === 'PONG' ? 'connected' : 'degraded',
      isConnected: pingResponse === 'PONG',
    };
  } catch (err) {
    return {
      status: 'disconnected',
      isConnected: false,
      error: err.message,
    };
  }
}

async function closeRedis() {
  if (redisClient) {
    if (typeof redisClient.quit === 'function') {
      await redisClient.quit();
    }
    redisClient = null;
    logger.info('Redis client disconnected.');
  }
}

module.exports = {
  getRedisClient,
  checkRedisHealth,
  closeRedis,
};
