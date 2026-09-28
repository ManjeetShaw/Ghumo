const app = require('./app');
const config = require('./config');
const { connectDB, closeDB } = require('./config/db');
const { getRedisClient, closeRedis } = require('./config/redis');
const logger = require('./utils/logger');

let server = null;

async function startServer() {
  try {
    // 1. Connect MongoDB
    await connectDB();

    // 2. Initialize Redis Client
    getRedisClient();

    // 3. Start Express HTTP Server
    server = app.listen(config.port, () => {
      logger.info(`=======================================================`);
      logger.info(`🚀 Travel Super-App Backend running on port ${config.port}`);
      logger.info(`🌐 Environment: ${config.env}`);
      logger.info(`🏥 Health Check: http://localhost:${config.port}/api/health`);
      logger.info(`=======================================================`);
    });

    // Timeout adjustments for long-running AI / Provider API calls
    server.timeout = 120000; // 2 minutes
    server.keepAliveTimeout = 65000;
    server.headersTimeout = 66000;

  } catch (err) {
    logger.error(`Fatal Server Startup Error: ${err.message}`, { stack: err.stack });
    process.exit(1);
  }
}

async function gracefulShutdown(signal) {
  logger.info(`Received ${signal}. Initiating graceful shutdown...`);

  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed.');
      await closeDB();
      await closeRedis();
      logger.info('Graceful shutdown completed successfully.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

if (require.main === module) {
  startServer();
}

module.exports = { startServer, gracefulShutdown };