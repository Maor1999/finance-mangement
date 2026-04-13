import "dotenv/config";
import reportRoutes from "./routes/reportRoutes.js";
import express from "express";
import { errorHandler } from "./errorHandler.js";
import { logger } from "./logger.js";
import { requestId } from "../shared/logger/requestId.js";
import { createRequestLogger } from "../shared/logger/requestLogger.js";

const app = express();
app.use(express.json());
app.use(requestId);
app.use(createRequestLogger(logger));

app.use('/reports', reportRoutes);

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.use(errorHandler);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
