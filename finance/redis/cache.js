import { redis } from "./redisConnect.js";
const REDIS_ENABLED = process.env.REDIS_ENABLED === "true";

const buildSummaryKey = (userId, year, month) => {
    const prefix = process.env.REDIS_PREFIX || "finance:";
    const monthWithZero = month < 10 ? "0" + month : String(month);
    return `${prefix}summary:${userId}:${year}-${monthWithZero}`;
};

const getFromCache = async (key) => {
    if (!REDIS_ENABLED) {
        return null;
    }
    const redisValue = await redis.get(key);
    if (!redisValue) {
        return null;
    }
    try {
        return JSON.parse(redisValue);
    }
    catch (err) {
        console.error("Error parsing JSON from Redis for key:", key, err);
        return null;
    }
};

const saveToCache = async (key, value, ttlInSeconds) => {
    if (!REDIS_ENABLED) {
        return null;
    }
    const jsonString = JSON.stringify(value);
    await redis.set(key, jsonString);
    await redis.expire(key, ttlInSeconds);
};

const clearMonthlySummary = async (userId, year, month) => {
    if (!REDIS_ENABLED) {
        return;
    }
    const key = buildSummaryKey(userId, year, month);
    await redis.del(key);
};
export { buildSummaryKey, getFromCache, saveToCache, clearMonthlySummary };
