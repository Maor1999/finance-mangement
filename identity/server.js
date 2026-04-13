import "dotenv/config";
import authRoutes from "./routes/authRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import express from "express";
import helmet from "helmet";
import { errorHandler } from "./errorHandler.js";
import { logger } from "./logger.js";
import { requestId } from "../shared/logger/requestId.js";
import { createRequestLogger } from "../shared/logger/requestLogger.js";

const app = express();

app.use(helmet());
app.use(express.json({ limit: "10kb" }));
app.use(requestId);
app.use(createRequestLogger(logger));

app.use('/auth', authRoutes);
app.use('/admin', adminRouter);

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
