import "dotenv/config";
import express from "express";
import { redis } from "./redis/redisConnect.js";
import { globalError } from "./globalError.js";
import { expenseRoutes } from "./routes/expenseRoutes.js";
import { summaryRoutes } from "./routes/summaryRoutes.js";
import { salaryRoutes } from "./routes/salaryRoutes.js";
import { logger } from "./logger.js";
import { requestId } from "../shared/logger/requestId.js";
import { createRequestLogger } from "../shared/logger/requestLogger.js";

const app = express();
const PORT = process.env.PORT || 4001;

app.use(express.json());
app.use(requestId);
app.use(createRequestLogger(logger));

app.use('/expenses', expenseRoutes);
app.use('/', summaryRoutes);
app.use("/salaries", salaryRoutes);

app.get('/health', (req, res) => {
  res.status(200).send('ok');
});

app.use(globalError);

const initRedis = async () => {
  if (process.env.REDIS_ENABLED !== "true") {
    logger.info("Redis disabled via .env");
    return;
  }

  if (!redis) {
    logger.warn("Redis client is not initialized");
    return;
  }

  try {
    const pong = await redis.ping();
    logger.info({ pong }, "Redis connected");
  } catch (err) {
    logger.warn({ err: err.message }, "Redis connection failed");
  }
};

app.listen(PORT, async () => {
  logger.info(`Finance service listening on port ${PORT}`);
  await initRedis();
});
