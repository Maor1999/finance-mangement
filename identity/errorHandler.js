import { zodError } from "../shared/zodError.js";
import { prismaError } from "../shared/prismaError.js";
import { logger } from "./logger.js";

const errorHandler = (err, req, res, next) => {
    const z = zodError(err);
    if (z) {
        return res.status(z.status).json({
            success: false,
            errors: {
                message: z.message,
                code: z.code,
                details: z.details
            }
        });
    }

    const p = prismaError(err);
    if (p) {
        return res.status(p.status).json({
            success: false,
            errors: {
                code: p.code,
                message: p.message,
                details: p.details
            }
        });
    }

    if (err?.message === "Email already exists") {
        return res.status(409).json({
            success: false,
            errors: { code: "EMAIL_CONFLICT", message: err.message }
        });
    }

    if (err?.message === "Invalid credentials") {
        return res.status(401).json({
            success: false,
            errors: { code: "INVALID_CREDENTIALS", message: err.message }
        });
    }

    if (err?.message?.startsWith("JWTExpired:")) {
        return res.status(401).json({
            success: false,
            errors: { code: "TOKEN_EXPIRED", message: "Token has expired" }
        });
    }

    if (err?.message?.startsWith("JWTInvalid:")) {
        return res.status(401).json({
            success: false,
            errors: { code: "TOKEN_INVALID", message: "Invalid token" }
        });
    }

    if (err?.message?.startsWith("RefreshTokenExpired:")) {
        return res.status(401).json({
            success: false,
            errors: { code: "REFRESH_TOKEN_EXPIRED", message: "Refresh token has expired" }
        });
    }

    if (err?.message?.startsWith("RefreshTokenInvalid:")) {
        return res.status(401).json({
            success: false,
            errors: { code: "REFRESH_TOKEN_INVALID", message: "Invalid or revoked refresh token" }
        });
    }

    if (err?.message?.startsWith("JWTUnknownError:")) {
        return res.status(401).json({
            success: false,
            errors: { code: "TOKEN_ERROR", message: "Token verification failed" }
        });
    }

    if (err?.message?.startsWith("VerifyError:")) {
        return res.status(401).json({
            success: false,
            errors: { code: "TOKEN_INVALID", message: "Invalid token format" }
        });
    }

    if (err?.message?.startsWith("SignError:")) {
        return res.status(500).json({
            success: false,
            errors: { code: "TOKEN_SIGN_ERROR", message: "Failed to generate token" }
        });
    }

    if (err?.message?.startsWith("ConfigError:")) {
        return res.status(500).json({
            success: false,
            errors: { code: "CONFIG_ERROR", message: "Server configuration error" }
        });
    }

    if (err.status && typeof err.status === "number" && err.status >= 400 && err.status < 600) {
        return res.status(err.status).json({
            success: false,
            errors: { code: err.code || "ERROR", message: err.message || "An error occurred" },
        });
    }

    (req.log ?? logger).error({ err }, "Unhandled error");
    return res.status(500).json({
        success: false,
        errors: {
            code: "INTERNAL_ERROR",
            message: err.message || "Something went wrong"
        }
    });
};

export { errorHandler };
