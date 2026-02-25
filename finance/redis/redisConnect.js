import Redis from "ioredis";

const REDIS_ENABLED = process.env.REDIS_ENABLED === "true";

let redis = null;

if (REDIS_ENABLED) {
    const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
    redis = new Redis(redisUrl);
}

export { redis };