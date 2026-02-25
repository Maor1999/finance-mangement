import { Router } from "express";
import { auth } from "../middlewares/auth.js";
import { validate, validateQuery, validateParams} from "../middlewares/validate.js";
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

const expenseRoutes = Router();

const formatMoney2 = (value) => Number(value).toFixed(2);
const formatExpense = (expense) => ({
    ...expense,
    amount: formatMoney2(expense.amount),
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

expenseRoutes
.route("/")
.post(auth, validate(createExpenseSchema), postExpense)
.get(auth, validateQuery(listExpensesQuerySchema), getListExpense);

expenseRoutes
.route("/:expenseId")
.get(auth, validateParams(expenseIdParamsSchema), getOneExpense)
.patch(auth, validateParams(expenseIdParamsSchema), validate(updateExpenseSchema), updateExpense)
.delete(auth, validateParams(expenseIdParamsSchema), deleteExpense);

export { expenseRoutes };
