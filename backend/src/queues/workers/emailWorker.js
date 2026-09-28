const { Worker } = require('bullmq');
const { redisConnection } = require('../queue.config');
const logger = require('../../utils/logger');

const emailWorker = new Worker(
  'emailQueue',
  async (job) => {
    const { to, subject, type, bookingReference, user } = job.data;
    logger.info(`[Email Worker] Processing '${type}' email for ${to} (Subject: ${subject})`);

    // Simulate PDF generation and email delivery delay
    await new Promise((resolve) => setTimeout(resolve, 50));

    return {
      success: true,
      jobId: job.id,
      to,
      subject,
      deliveredAt: new Date().toISOString(),
    };
  },
  { connection: redisConnection }
);

emailWorker.on('completed', (job, result) => {
  logger.info(`[Email Worker] Job ${job.id} completed successfully for ${result.to}`);
});

emailWorker.on('failed', (job, err) => {
  logger.error(`[Email Worker] Job ${job?.id} failed: ${err.message}`);
});

module.exports = emailWorker;
