import {createExpense,
getExpenseById,
listExpensesByUser,
updateExpense,
deleteExpense,
} from "../dataAccessDb/expenseData.js";
import { clearMonthlySummary } from "../redis/cache.js";

const TZ = "Asia/Jerusalem";
const getYearAndMonthFromDate = (dateValue) => {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    const error = new Error("Invalid date value on expense");
    error.code = "INVALID_EXPENSE_DATE_FOR_CACHE";
    throw error;
  }

  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
  });

  const parts = dtf.formatToParts(date);
  const yearStr = parts.find((p) => p.type === "year")?.value;
  const monthStr = parts.find((p) => p.type === "month")?.value;

  const year = Number(yearStr);
  const month = Number(monthStr);

  if (!Number.isInteger(year) || !Number.isInteger(month)) {
    const error = new Error("Failed to extract year/month for cache invalidation");
    error.code = "INVALID_EXPENSE_DATE_FOR_CACHE";
    throw error;
  }
  return { year, month };
};

const createExpenseForUser = async (userId, data) => {
    const expenseObject = {
      userId,
      title: data.title,
      category: data.category,
      amount: data.amount,
      date: data.date,
    };
    const createdExpense = await createExpense(expenseObject);

  try {
    const { year, month } = getYearAndMonthFromDate(createdExpense.date);
    await clearMonthlySummary(userId, year, month);
  }
  catch (err) {
  console.warn("Failed to clear monthly summary cache (expense)", err);
}
  return createdExpense;
};

const listExpensesForUser = async ({
  userId,
  from,
  to,
  skip = 0,
  take = 50,}) => {
  const expenses = await listExpensesByUser({
    userId,
    from,
    to,
    skip,
    take,
  });
  return expenses;
};

const getExpenseForUser = async(userId, expenseId) =>{
  const expense = await getExpenseById(expenseId);
  if(!expense || expense.userId !== userId){
    const error = new Error("Expense not found");
    error.status = 404;
    error.code = "EXPENSE_NOT_FOUND";
    throw error;
  }
  return expense;
};

const updateExpenseForUser  = async(userId, expenseId, data) =>{
  const existExpense = await getExpenseById(expenseId);
  if (!existExpense || existExpense.userId !== userId) {
  const error = new Error("Expense not found");
  error.status = 404;
  error.code = "EXPENSE_NOT_FOUND";
  throw error;
}
  const updated = await updateExpense(expenseId, data);

  try {
    const { year: oldYear, month: oldMonth } =
    getYearAndMonthFromDate(existExpense.date);
    await clearMonthlySummary(userId, oldYear, oldMonth);

    const { year: newYear, month: newMonth } =
    getYearAndMonthFromDate(updated.date);
    if (oldYear !== newYear || oldMonth !== newMonth) {
      await clearMonthlySummary(userId, newYear, newMonth)
    }
  }
  catch (err) {
  console.warn("Failed to clear monthly summary cache (expense)", err);
}
  return updated;
}

const deleteExpenseForUser = async (userId, expenseId) => {
  const exist = await getExpenseById(expenseId);
  if (!exist || exist.userId !== userId) {
  const error = new Error("Expense not found");
  error.status = 404;
  error.code = "EXPENSE_NOT_FOUND";
  throw error;
  }
  const deleted = await deleteExpense(expenseId)
  try {
    const { year, month } = getYearAndMonthFromDate(exist.date);
    await clearMonthlySummary(userId, year, month);
  }
  catch (err) {
  console.warn("Failed to clear monthly summary cache (expense)", err);
}
  return deleted;
};

export {
  createExpenseForUser,
  listExpensesForUser,
  getExpenseForUser,
  updateExpenseForUser,
  deleteExpenseForUser,};