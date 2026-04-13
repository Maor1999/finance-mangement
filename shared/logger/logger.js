import pino from "pino";
import pinoCaller from "pino-caller";

const createLogger = (service) => {
  const base = pino({
    level: process.env.LOG_LEVEL || "info",
    timestamp: pino.stdTimeFunctions.isoTime,
    base: { service },
    formatters: {
      level(label) {
        return { level: label };
      },
    },
  });

  return pinoCaller(base);
};

export { createLogger };
