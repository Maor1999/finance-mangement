import {Router} from "express";
import { auth } from "../middlewares/auth.js";

import {
createSalaryForUser,
listSalariesForUser,
getSalaryForUser,
updateSalaryForUser,
deleteSalaryForUser,
}from "../services/salaryService.js";

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

const salaryRoutes = Router();

const formatMoney2 = (value) => Number(value).toFixed(2);
const formatSalary = (salary) => ({
  ...salary,
  amount: formatMoney2(salary.amount),
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

salaryRoutes
.route("/")
.post(auth, validate(createSalarySchema),
postSalary)

.get(auth, validateQuery(listSalariesQuerySchema),
getListSalary);

salaryRoutes
.route("/:salaryId")
.get(auth, validateParams(salaryIdParamsSchema),
getOneSalary)

.patch(auth, validateParams(salaryIdParamsSchema), validate(updateSalarySchema),
updateSalary)

.delete(auth, validateParams(salaryIdParamsSchema),
deleteSalary)

export { salaryRoutes };
