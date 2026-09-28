const { getRedisClient } = require('../config/redis');
const logger = require('../utils/logger');

function idempotencyMiddleware(ttlSeconds = 86400) {
  return async (req, res, next) => {
    const idempotencyKey = req.headers['idempotency-key'] || req.headers['x-idempotency-key'];

    if (!idempotencyKey) {
      return next(); // No key provided, standard request handling
    }

    const redisKey = `idempotency:${idempotencyKey}`;

    try {
      const redis = getRedisClient();
      const cachedResponse = await redis.get(redisKey);

      if (cachedResponse) {
        logger.info(`Idempotent hit for key '${idempotencyKey}' - returning cached response`);
        const parsed = JSON.parse(cachedResponse);
        return res.status(parsed.statusCode).json(parsed.body);
      }

      // Intercept res.json to cache response payload in Redis
      const originalJson = res.json.bind(res);

      res.json = (body) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          redis
            .set(
              redisKey,
              JSON.stringify({ statusCode: res.statusCode, body }),
              'EX',
              ttlSeconds
            )
            .catch((err) => logger.error(`Failed to cache idempotency key: ${err.message}`));
        }
        return originalJson(body);
      };

      req.idempotencyKey = idempotencyKey;
      next();
    } catch (err) {
      logger.error(`Idempotency middleware error: ${err.message}`);
      next(); // Fail-open to allow request to proceed if Redis fails
    }
  };
}

module.exports = idempotencyMiddleware;
