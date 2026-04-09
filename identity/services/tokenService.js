import "dotenv/config";
import jwt from "jsonwebtoken";

const { AUTH_SECRET, JWT_EXPIRES_IN, REFRESH_SECRET, REFRESH_EXPIRES_IN } = process.env;

if (!AUTH_SECRET || AUTH_SECRET.length < 32) {
  throw new Error(
    "ConfigError: AUTH_SECRET is missing or too weak. Define a strong key (>= 32 chars) in .env."
  );
}

if (!REFRESH_SECRET || REFRESH_SECRET.length < 32) {
  throw new Error(
    "ConfigError: REFRESH_SECRET is missing or too weak. Define a strong key (>= 32 chars) in .env."
  );
}

const accessExpSeconds = Number.parseInt(JWT_EXPIRES_IN, 10);
if (!Number.isFinite(accessExpSeconds) || accessExpSeconds <= 0) {
  throw new Error(
    "ConfigError: JWT_EXPIRES_IN must be a positive number (in seconds) in .env."
  );
}

const refreshExpSeconds = Number.parseInt(REFRESH_EXPIRES_IN, 10);
if (!Number.isFinite(refreshExpSeconds) || refreshExpSeconds <= 0) {
  throw new Error(
    "ConfigError: REFRESH_EXPIRES_IN must be a positive number (in seconds) in .env."
  );
}

function signAccessToken(user) {
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
      expiresIn: accessExpSeconds,
    });
  } catch (err) {
    throw new Error(`SignError: failed to sign access token. ${err?.message || err}`);
  }
}

function signRefreshToken(user) {
  if (!user?.id || !user?.email) {
    throw new Error("SignError: user.id and user.email are required.");
  }
  const payload = {
    sub: user.id,
    email: user.email,
  };
  try {
    return jwt.sign(payload, REFRESH_SECRET, {
      algorithm: "HS256",
      expiresIn: refreshExpSeconds,
    });
  } catch (err) {
    throw new Error(`SignError: failed to sign refresh token. ${err?.message || err}`);
  }
}

function verifyAccessToken(token) {
  if (!token || typeof token !== "string") {
    throw new Error("VerifyError: token must be a non-empty string.");
  }
  try {
    return jwt.verify(token, AUTH_SECRET, { algorithms: ["HS256"] });
  } catch (err) {
    if (err?.name === "TokenExpiredError")
      throw new Error("JWTExpired: access token has expired.");
    if (err?.name === "JsonWebTokenError")
      throw new Error("JWTInvalid: invalid access token or signature.");
    throw new Error(`JWTUnknownError: ${err?.message || err}`);
  }
}

function verifyRefreshToken(token) {
  if (!token || typeof token !== "string") {
    throw new Error("VerifyError: token must be a non-empty string.");
  }
  try {
    return jwt.verify(token, REFRESH_SECRET, { algorithms: ["HS256"] });
  } catch (err) {
    if (err?.name === "TokenExpiredError")
      throw new Error("RefreshTokenExpired: refresh token has expired.");
    if (err?.name === "JsonWebTokenError")
      throw new Error("RefreshTokenInvalid: invalid refresh token or signature.");
    throw new Error(`JWTUnknownError: ${err?.message || err}`);
  }
}

// Keep signToken/verifyToken as aliases for access token (backwards compat with shared/auth.js)
const signToken = signAccessToken;
const verifyToken = verifyAccessToken;

export { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken, signToken, verifyToken, refreshExpSeconds };
