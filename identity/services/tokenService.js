import "dotenv/config";
import jwt from "jsonwebtoken";

const { AUTH_SECRET, JWT_EXPIRES_IN } = process.env;

if (!AUTH_SECRET || AUTH_SECRET.length < 32) {
  throw new Error(
    "ConfigError: AUTH_SECRET is missing or too weak. Define a strong key (>= 32 chars) in .env."
  );
}

const expSeconds = Number.parseInt(JWT_EXPIRES_IN, 10);
if (!Number.isFinite(expSeconds) || expSeconds <= 0) {
  throw new Error(
    "ConfigError: JWT_EXPIRES_IN must be a positive number (in seconds) in .env."
  );
}

function signToken(user) {
  if (!user?.id || !user?.email) {
    throw new Error("SignError: user.id and user.email are required.");
  }
  const payload = {
    sub: user.id,
    email: user.email,
    ...(user.role ? { role: user.role } : {}),
  };
  try {
    return jwt.sign(payload, AUTH_SECRET, {
      algorithm: "HS256",
      expiresIn: expSeconds,
    });
  } catch (err) {
    throw new Error(`SignError: failed to sign token. ${err?.message || err}`);
  }
}

function verifyToken(token) {
  if (!token || typeof token !== "string") {
    throw new Error("VerifyError: token must be a non-empty string.");
  }
  try {
    return jwt.verify(token, AUTH_SECRET, { algorithms: ["HS256"] });
  } catch (err) {
    if (err?.name === "TokenExpiredError")
      throw new Error("JWTExpired: token has expired.");
    if (err?.name === "JsonWebTokenError")
      throw new Error("JWTInvalid: invalid token or signature.");
    throw new Error(`JWTUnknownError: ${err?.message || err}`);
  }
}

export { signToken, verifyToken };


