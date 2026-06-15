const { createClient } = require('redis');
const { REDIS_URL } = require('./env');

let redisClient = null;
let isRedisConnected = false;

// ----------------------------------------------------------------------
// CHOOSE ONE REDIS CONFIGURATION:
// Comment out the option you are NOT using and uncomment the one you want.
// ----------------------------------------------------------------------

// OPTION 1: Localhost (for Docker Desktop/Local Dev)
redisClient = createClient({
  socket: {
    host: '127.0.0.1',
    port: 6379
  }
});

// OPTION 2: Production URL (for Render/Production Deploy)
/*
redisClient = createClient({
  url: REDIS_URL
});
*/

// ----------------------------------------------------------------------

if (redisClient) {
  redisClient.on('connect', () => {
    console.log('[Redis] Connecting to database...');
  });

  redisClient.on('ready', () => {
    isRedisConnected = true;
    console.log('[Redis] Connected successfully. Ready to store rate limit data.');
  });

  redisClient.on('error', (err) => {
    isRedisConnected = false;
    console.error('[Redis] Client error/connection failure:', err.message || err);
  });

  redisClient.on('end', () => {
    isRedisConnected = false;
    console.log('[Redis] Connection closed.');
  });

  // Attempt to connect asynchronously. Catch startup failures so the server does not crash.
  redisClient.connect().catch((err) => {
    console.warn('[Redis] Silent Fallback: Could not connect to Redis server at startup. Rate limiting will run in memory.', err.message || err);
  });
}

module.exports = {
  redisClient,
  isReady: () => isRedisConnected
};