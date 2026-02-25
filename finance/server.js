import "dotenv/config";
import express from "express";
import { redis } from "./redis/redisConnect.js";
import { globalError } from "./globalError.js";
import { expenseRoutes } from "./routes/expenseRoutes.js";
import { summaryRoutes } from "./routes/summaryRoutes.js";
import { salaryRoutes } from "./routes/salaryRoutes.js";

const app = express();
const PORT = process.env.PORT || 4001;

app.use(express.json());

app.use('/expenses', expenseRoutes);
app.use('/', summaryRoutes);
app.use("/salaries", salaryRoutes);

app.get('/health', (req, res) => {
res.status(200).send('ok');
});

app.use(globalError);

const initRedis = async () => {
if (process.env.REDIS_ENABLED !== "true") {
console.log("Redis disabled via .env");
return;
}

if (!redis) {
    console.log("Redis client is not initialized");
    return;
}

try {
const pong = await redis.ping();
console.log("Redis connected:", pong);
} catch (err) {
console.warn("Redis connection failed:", err.message);
}
};

app.listen(PORT, async () => {
console.log(`Finance service listening on port ${PORT}`);
await initRedis();
});
