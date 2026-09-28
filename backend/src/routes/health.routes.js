const express = require('express');
const router = express.Router();
const { getDBStatus } = require('../config/db');
const { checkRedisHealth } = require('../config/redis');
const { successResponse } = require('../utils/apiResponse');

router.get('/health', async (req, res, next) => {
  try {
    const dbStatus = getDBStatus();
    const redisStatus = await checkRedisHealth();

    const isHealthy = dbStatus.isConnected && redisStatus.isConnected;

    const healthData = {
      status: isHealthy ? 'HEALTHY' : 'DEGRADED',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      services: {
        database: dbStatus,
        redis: redisStatus,
      },
    };

    return successResponse(
      res,
      healthData,
      `System status: ${healthData.status}`,
      isHealthy ? 200 : 503
    );
  } catch (err) {
    next(err);
  }
});

module.exports = router;
