import { Router } from "express";
import { auth } from "../middlewares/auth.js";
import { validateParams } from "../middlewares/validate.js";
import { monthlySummaryParamsSchema } from "../zodSchema/summarySchemas.js";
import { getMonthlySummaryForUser } from "../services/summaryService.js";

const summaryRoutes = Router();

const getMonthlySummary = async (req, res, next) => {
  const userId = req.user.userId;
  const { year, month } = req.validatedParams;
  const summary = await getMonthlySummaryForUser(userId, year, month);

  res.status(200).json({
    success: true,
    data: summary,
    message: "Monthly summary fetched successfully",
  });
};

summaryRoutes.get("/summary/:year/:month", auth,
validateParams(monthlySummaryParamsSchema), getMonthlySummary);

export { summaryRoutes };
