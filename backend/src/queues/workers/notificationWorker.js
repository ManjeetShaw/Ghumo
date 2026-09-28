const { Worker } = require('bullmq');
const { redisConnection } = require('../queue.config');
const Notification = require('../../models/notification.model');
const logger = require('../../utils/logger');

const notificationWorker = new Worker(
  'notificationQueue',
  async (job) => {
    const { userId, title, message, type, data } = job.data;
    logger.info(`[Notification Worker] Dispatching '${type}' notification to user ${userId}`);

    const notification = await Notification.create({
      userId,
      title,
      message,
      type: type || 'SYSTEM',
      data: data || {},
    });

    return {
      success: true,
      notificationId: notification._id,
      userId,
    };
  },
  { connection: redisConnection }
);

notificationWorker.on('completed', (job, result) => {
  logger.info(`[Notification Worker] Job ${job.id} completed: Notification ${result.notificationId} delivered`);
});

notificationWorker.on('failed', (job, err) => {
  logger.error(`[Notification Worker] Job ${job?.id} failed: ${err.message}`);
});

module.exports = notificationWorker;
