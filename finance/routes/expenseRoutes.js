import { Router } from "express";
import { auth, requireRole } from "../middlewares/auth.js";
import { validate, validateQuery, validateParams} from "../middlewares/validate.js";
import { writeLimiter } from "../middlewares/rateLimiter.js";
import {
createExpenseSchema,
updateExpenseSchema,
listExpensesQuerySchema,
expenseIdParamsSchema,
} from "../zodSchema/expenseSchemas.js";
import {
createExpenseForUser,
listExpensesForUser,
getExpenseForUser,
updateExpenseForUser,
deleteExpenseForUser,
} from "../services/expenseService.js";
import { listAllExpenses } from "../dataAccessDb/expenseData.js";
import { formatMoney } from "../utils/formatters.js";

const expenseRoutes = Router();

const formatExpense = (expense) => ({
    ...expense,
    amount: formatMoney(expense.amount),
});

const postExpense = async (req, res, next) => {
    const userId = req.user.userId;
    const data = req.validatedBody;
    const addExpense = await createExpenseForUser(userId, data);
    res.status(201).json({
    success: true,
    message: "expense created successfully",
    data: formatExpense(addExpense),
    });
};

const getListExpense = async (req, res, next) => {
    const userId = req.user.userId;
    const { from, to, skip, take } = req.validatedQuery;
    const expenses = await listExpensesForUser({
        userId,
        from,
        to,
        skip,
        take,
    });
    res.status(200).json({
        success: true,
        message: "expenses fetched successfully",
        data: expenses.map(formatExpense),
    });
};

const getOneExpense = async (req, res, next) => {
    const userId = req.user.userId;
    const { expenseId } = req.validatedParams;
    const expense = await getExpenseForUser(userId, expenseId);
    res.status(200).json({
        success: true,
        message: "expense fetched successfully",
        data: formatExpense(expense),
    });
};

const updateExpense = async (req, res, next) => {
    const userId = req.user.userId;
    const { expenseId } = req.validatedParams;
    const data = req.validatedBody;
    const updated = await updateExpenseForUser(userId, expenseId, data);
    res.status(200).json({
        success: true,
        message: "expense updated successfully",
        data: formatExpense(updated)
    });
};

const deleteExpense = async (req, res, next) => {
    const userId = req.user.userId;
    const { expenseId } = req.validatedParams;
    const deleted = await deleteExpenseForUser(userId, expenseId);
    res.status(200).json({
        success: true,
        message: "expense deleted successfully",
        data: formatExpense(deleted)
    });
};

const getAllExpensesAdmin = async (req, res, next) => {
    const { from, to, skip, take } = req.validatedQuery;
    const expenses = await listAllExpenses({ from, to, skip, take });
    res.status(200).json({
        success: true,
        message: "all expenses fetched successfully",
        data: expenses.map(formatExpense),
    });
};

expenseRoutes
.route("/admin")
.get(auth, requireRole("ADMIN"), validateQuery(listExpensesQuerySchema), getAllExpensesAdmin);

expenseRoutes
.route("/")
.post(auth, writeLimiter, validate(createExpenseSchema), postExpense)
.get(auth, validateQuery(listExpensesQuerySchema), getListExpense);

expenseRoutes
.route("/:expenseId")
.get(auth, validateParams(expenseIdParamsSchema), getOneExpense)
.patch(auth, writeLimiter, validateParams(expenseIdParamsSchema), validate(updateExpenseSchema), updateExpense)
.delete(auth, writeLimiter, validateParams(expenseIdParamsSchema), deleteExpense);

export { expenseRoutes };
