const createRequestLogger = (logger) => (req, res, next) => {
  req.log = logger.child({ requestId: req.id });
  const start = Date.now();

  res.on("finish", () => {
    const durationMs = Date.now() - start;
    const level =
      res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";

    req.log[level]({
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs,
      userId: req.user?.userId,
      ip: req.ip,
    });
  });

  next();
};

export { createRequestLogger };
