import {Router} from "express";
import { auth, requireRole } from "../middlewares/auth.js";
import { writeLimiter } from "../middlewares/rateLimiter.js";

import {
createSalaryForUser,
listSalariesForUser,
getSalaryForUser,
updateSalaryForUser,
deleteSalaryForUser,
}from "../services/salaryService.js";
import { listAllSalaries } from "../dataAccessDb/salaryData.js";

import {
createSalarySchema,
updateSalarySchema,
listSalariesQuerySchema,
salaryIdParamsSchema,
}from "../zodSchema/salarySchemas.js";

import {
validate,
validateQuery,
validateParams,
}from "../middlewares/validate.js";
import { formatMoney } from "../utils/formatters.js";

const salaryRoutes = Router();

const formatSalary = (salary) => ({
  ...salary,
  amount: formatMoney(salary.amount),
});

const postSalary = async (req, res, next) => {
    const userId = req.user.userId;
    const data = req.validatedBody;
    const addSalary = await createSalaryForUser(userId, data);
    res.status(201).json({
        success: true,
        message: "salary created successfully",
        data: formatSalary(addSalary)
    });
};

const getListSalary = async (req, res, next) => {
  const userId = req.user.userId;
  const { from, to, skip, take } = req.validatedQuery;
  const salaries = await listSalariesForUser({
    userId,
    from,
    to,
    skip,
    take,
  });
  res.status(200).json({
    success: true,
    message: "salaries fetched successfully",
    data: salaries.map(formatSalary),
  });
};

const getOneSalary = async(req, res, next) =>{
  const userId = req.user.userId;
  const  {salaryId} = req.validatedParams;
  const getSalary = await getSalaryForUser(userId, salaryId);
  res.status(200).json({
    success: true,
    message: "salary fetched successfully",
    data: formatSalary(getSalary)
  });
};

const updateSalary = async(req, res, next) =>{
  const userId = req.user.userId;
  const data = req.validatedBody;
  const {salaryId} = req.validatedParams;
  const updatedSalary = await updateSalaryForUser(userId, salaryId, data);
  res.status(200).json({
    success: true,
    message: "salary updated successfully",
    data: formatSalary(updatedSalary)
  });
};

const deleteSalary = async(req, res, next) =>{
  const userId = req.user.userId;
  const {salaryId} = req.validatedParams;
  const deletedSalary = await deleteSalaryForUser(userId, salaryId);
  res.status(200).json({
    success: true,
    message: "salary deleted successfully",
    data: formatSalary(deletedSalary)
  });
};

const getAllSalariesAdmin = async (req, res, next) => {
  const { from, to, skip, take } = req.validatedQuery;
  const salaries = await listAllSalaries({ from, to, skip, take });
  res.status(200).json({
    success: true,
    message: "all salaries fetched successfully",
    data: salaries.map(formatSalary),
  });
};

salaryRoutes
.route("/admin")
.get(auth, requireRole("ADMIN"), validateQuery(listSalariesQuerySchema), getAllSalariesAdmin);

salaryRoutes
.route("/")
.post(auth, writeLimiter, validate(createSalarySchema),
postSalary)

.get(auth, validateQuery(listSalariesQuerySchema),
getListSalary);

salaryRoutes
.route("/:salaryId")
.get(auth, validateParams(salaryIdParamsSchema),
getOneSalary)

.patch(auth, writeLimiter, validateParams(salaryIdParamsSchema), validate(updateSalarySchema),
updateSalary)

.delete(auth, writeLimiter, validateParams(salaryIdParamsSchema),
deleteSalary)

export { salaryRoutes };
