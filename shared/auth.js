import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      const err = new Error("Missing Authorization header");
      err.status = 401;
      err.code = "AUTH_MISSING_HEADER";
      return next(err);
    }

    if (!authHeader.startsWith("Bearer ")) {
      const err = new Error("Invalid Authorization format");
      err.status = 401;
      err.code = "AUTH_INVALID_FORMAT";
      return next(err);
    }

    const token = authHeader.split(" ")[1]?.trim();

    if (!token) {
      const err = new Error("Missing token");
      err.status = 401;
      err.code = "AUTH_MISSING_TOKEN";
      return next(err);
    }

    const secret = process.env.AUTH_SECRET;
    if (!secret) {
      const err = new Error("AUTH_SECRET is not configured");
      err.status = 500;
      err.code = "AUTH_MISCONFIGURED_SECRET";
      return next(err);
    }

    let payload;
    try {
      payload = jwt.verify(token, secret);
    } catch (e) {
      const err = new Error("Invalid or expired token");
      err.status = 401;
      err.code = "AUTH_INVALID_TOKEN";
      return next(err);
    }

    if (!payload.sub || !payload.email) {
      const err = new Error("Invalid token payload");
      err.status = 401;
      err.code = "AUTH_INVALID_PAYLOAD";
      return next(err);
    }

    req.user = {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      token,
    };

    return next();
  } catch (error) {
    return next(error);
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    const err = new Error("Forbidden");
    err.status = 403;
    err.code = "FORBIDDEN";
    return next(err);
  }
  next();
};

export { auth, requireRole };
