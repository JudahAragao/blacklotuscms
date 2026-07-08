import { logger } from './logger';

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

interface RateLimiterConfig {
  driver: 'memory' | 'redis';
  windowMs: number;
  redis?: {
    host: string;
    port: number;
    password?: string;
  };
}

// In-memory store
const memoryStore = new Map<string, RateLimitBucket>();

// Redis client (lazy loaded)
let redisClient: any = null;

async function getRedisClient(config: RateLimiterConfig["redis"]) {
  if (redisClient) return redisClient;

  try {
    const { createClient } = await import('redis');
    redisClient = createClient({
      socket: {
        host: config?.host || 'localhost',
        port: config?.port || 6379,
      },
      password: config?.password,
    });

    redisClient.on('error', (err: any) => {
      logger.error('[RateLimiter] Redis error:', err);
      redisClient = null;
    });

    await redisClient.connect();
    logger.info('[RateLimiter] Connected to Redis');
    return redisClient;
  } catch (error) {
    logger.warn('[RateLimiter] Redis not available, falling back to memory');
    return null;
  }
}

export function createRateLimiter(config: RateLimiterConfig) {
  const { driver, windowMs } = config;

  async function check(key: string, limit: number): Promise<boolean> {
    const now = Date.now();

    if (driver === 'redis') {
      const client = await getRedisClient(config.redis);
      if (client) {
        try {
          const key_ = `ratelimit:${key}`;
          const current = await client.incr(key_);

          if (current === 1) {
            await client.pExpire(key_, windowMs);
          }

          const ttl = await client.pTTL(key_);
          if (ttl <= 0) {
            await client.set(key_, 1, { PX: windowMs });
            return true;
          }

          return current <= limit;
        } catch (error) {
          logger.error('[RateLimiter] Redis error, falling back to memory:', error);
        }
      }
    }

    // Fallback to in-memory
    const bucket = memoryStore.get(key);

    if (!bucket || now > bucket.resetAt) {
      memoryStore.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }

    if (bucket.count >= limit) {
      return false;
    }

    bucket.count++;
    return true;
  }

  return { check };
}

// Default rate limiter instance
export const rateLimiter = createRateLimiter({
  driver: (process.env.RATE_LIMIT_DRIVER as 'memory' | 'redis') || 'memory',
  windowMs: 60000, // 1 minute
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  },
});
