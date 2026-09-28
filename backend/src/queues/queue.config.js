const { Queue } = require('bullmq');
const config = require('../config');
const logger = require('../utils/logger');

const redisUrl = new URL(config.redisUrl || 'redis://127.0.0.1:6379');
const redisConnection = {
  host: redisUrl.hostname || '127.0.0.1',
  port: parseInt(redisUrl.port, 10) || 6379,
  maxRetriesPerRequest: null,
};

let bookingQueue, notificationQueue, emailQueue, refundQueue, priceWatchQueue;

if (config.env === 'test') {
  const createMockQueue = (name) => ({
    name,
    add: async (jobName, data) => ({ id: 'mock-job-id', name: jobName, data }),
    close: async () => {},
  });

  bookingQueue = createMockQueue('bookingQueue');
  notificationQueue = createMockQueue('notificationQueue');
  emailQueue = createMockQueue('emailQueue');
  refundQueue = createMockQueue('refundQueue');
  priceWatchQueue = createMockQueue('priceWatchQueue');
} else {
  const defaultJobOptions = {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  };

  bookingQueue = new Queue('bookingQueue', { connection: redisConnection, defaultJobOptions });
  notificationQueue = new Queue('notificationQueue', { connection: redisConnection, defaultJobOptions });
  emailQueue = new Queue('emailQueue', { connection: redisConnection, defaultJobOptions });
  refundQueue = new Queue('refundQueue', { connection: redisConnection, defaultJobOptions });
  priceWatchQueue = new Queue('priceWatchQueue', { connection: redisConnection, defaultJobOptions });
}

logger.info('BullMQ queues initialized: bookingQueue, notificationQueue, emailQueue, refundQueue, priceWatchQueue');

module.exports = {
  redisConnection,
  bookingQueue,
  notificationQueue,
  emailQueue,
  refundQueue,
  priceWatchQueue,
};
