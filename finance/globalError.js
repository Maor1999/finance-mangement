import { zodError } from "../shared/zodError.js";
import { prismaError } from "../shared/prismaError.js";

const globalError = (err, req, res, next) => {
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
        message: p.message,
        code: p.code,
        details: p.details
    }
    });
    }

    if (err.status && typeof err.status === 'number' && err.status >= 400 && err.status < 600) {
        return res.status(err.status).json({
            success: false,
            errors: {
                code: err.code || "CUSTOM_ERROR",
                message: err.message || "An error occurred",
            },
        });
    }

        console.error("Unhandled error:", err);
        return res.status(500).json({
        success: false,
        errors: {
        code: "INTERNAL_ERROR",
        message: err.message || "Something went wrong",
    },
    });
};

export { globalError }; 