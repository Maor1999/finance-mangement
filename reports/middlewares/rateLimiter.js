import rateLimit from "express-rate-limit";

const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW || "15") * 60 * 1000;
const max = parseInt(process.env.RATE_LIMIT_MAX_ATTEMPTS || "30");

const reportLimiter = rateLimit({
  windowMs,
  max,
  keyGenerator: (req) => req.user?.userId ?? req.ip,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later" },
});

export { reportLimiter };
