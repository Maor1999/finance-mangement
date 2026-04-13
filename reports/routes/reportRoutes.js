import {userReport} from "../services/reportService.js"
import {Router} from "express";
import {auth} from "../middlewares/auth.js";
import {validateParams} from "../middlewares/validate.js";
import {reportSchema} from "../zodSchema/reportSchemas.js";
import {asyncHandler} from "../middlewares/asyncHandler.js";
import {reportLimiter} from "../middlewares/rateLimiter.js";

const reportRoute = Router();

const getUserReport = async(req, res) =>{
    const {year, month} = req.validatedParams;
    const {userId, token} = req.user;

    const report = await userReport(userId, year, month, token, req.id);
    return res.status(200).json(report);
}

reportRoute.get(
"/:year/:month",
auth,
reportLimiter,
validateParams(reportSchema),
asyncHandler(getUserReport));

export default reportRoute; 