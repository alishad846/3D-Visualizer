const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis').default || require('rate-limit-redis');
const redisModule = require('../config/redis');

// A smart fallback store that wraps RedisStore and delegates to MemoryStore 
// if Redis is unavailable, disconnected, or fails during requests.
class SmartRedisStore {
  constructor(prefix) {
    this.prefix = prefix;
    this.redisStore = redisModule.redisClient
      ? new RedisStore({
          prefix: this.prefix,
          sendCommand: (...args) => redisModule.redisClient.sendCommand(args),
        })
      : null;
    this.memoryStore = new rateLimit.MemoryStore();
  }

  async init(options) {
    if (this.redisStore && this.redisStore.init) {
      try {
        await this.redisStore.init(options);
      } catch (err) {
        console.warn(`[RateLimiter] Redis store init failed for prefix ${this.prefix}, using memory fallback:`, err.message);
      }
    }
    if (this.memoryStore.init) {
      await this.memoryStore.init(options);
    }
  }

  async increment(key) {
    if (redisModule.isReady() && this.redisStore) {
      try {
        return await this.redisStore.increment(key);
      } catch (err) {
        console.error(`[RateLimiter] Redis store increment failed for prefix ${this.prefix}, falling back to memory store:`, err.message);
      }
    }
    return await this.memoryStore.increment(key);
  }

  async decrement(key) {
    if (redisModule.isReady() && this.redisStore) {
      try {
        return await this.redisStore.decrement(key);
      } catch (err) {
        console.error(`[RateLimiter] Redis store decrement failed for prefix ${this.prefix}, falling back to memory store:`, err.message);
      }
    }
    return await this.memoryStore.decrement(key);
  }

  async resetKey(key) {
    if (redisModule.isReady() && this.redisStore) {
      try {
        return await this.redisStore.resetKey(key);
      } catch (err) {
        console.error(`[RateLimiter] Redis store resetKey failed for prefix ${this.prefix}, falling back to memory store:`, err.message);
      }
    }
    return await this.memoryStore.resetKey(key);
  }
}

// Store resolving logic: use SmartRedisStore in production, undefined (default memory) in dev
const getStore = (prefix) => {
  return process.env.NODE_ENV === 'production'
    ? new SmartRedisStore(prefix)
    : undefined;
};

// 1. Global Limiter (500 requests per 15 minutes)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  store: getStore('rl:global'),
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests. Please try again later.',
      code: 'GLOBAL_RATE_LIMITED'
    });
  }
});

// 2. Auth Limiter (10 requests per 15 minutes)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  store: getStore('rl:auth'),
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many attempts. Please try again later.',
      code: 'AUTH_RATE_LIMITED'
    });
  }
});

// 3. OTP Limiter (5 requests per 15 minutes)
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  store: getStore('rl:otp'),
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many verification attempts. Please try again later.',
      code: 'OTP_RATE_LIMITED'
    });
  }
});

// 4. AI Limiter (15 requests per 15 minutes)
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  store: getStore('rl:ai'),
  handler: (req, res) => {
    res.status(429).json({
      error: 'AI request limit reached. Please try again later.',
      code: 'AI_RATE_LIMITED'
    });
  }
});

// 5. Bulk Upload Limiter (10 requests per 15 minutes)
const bulkUploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  store: getStore('rl:bulk'),
  keyGenerator: (req) => req.user?.id || req.ip,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Bulk upload limit reached. Please try again later.',
      code: 'BULK_RATE_LIMITED'
    });
  }
});

module.exports = {
  globalLimiter,
  authLimiter,
  otpLimiter,
  aiLimiter,
  bulkUploadLimiter
};