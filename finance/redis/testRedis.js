import { redis } from "./redisConnect.js";

async function testConnection() {
try {
await redis.set("test:key", "hello redis");
const value = await redis.get("test:key");
console.log("Redis is working:", value);
} catch (err) {
console.error("Redis connection failed:", err);
}finally {
if (redis) redis.disconnect();
}
}

testConnection();
