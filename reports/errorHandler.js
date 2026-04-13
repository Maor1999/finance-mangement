import {zodError} from "../shared/zodError.js"
import {prismaError} from "../shared/prismaError.js"
import { logger } from "./logger.js";

const errorHandler = (err, req, res, next ) =>{
    const z = zodError(err);
    if(z){
        return res.status(z.status).json({
            success: false,
            errors:{
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

if (err && typeof err.status === "number"){
    return res.status(err.status).json({
        success: false,
        errors:{
            code: err.code || "APP_ERROR",
            message: err.message || "REQUEST_FAILED",
            details: err.details
        }
    });
}
(req.log ?? logger).error({ err }, "Unhandled error");

return res.status(500).json({
    success: false,
    errors:{
        message: "something went wrong",
        code: "INTERNAL_ERROR"
    }
});
}


export{errorHandler};
