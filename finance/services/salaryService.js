import {
createSalary,
getSalaryById,
listSalariesByUser,
updateSalary,
deleteSalary,
} from "../dataAccessDb/salaryData.js";
import { clearMonthlySummary } from "../redis/cache.js";

const TZ = "Asia/Jerusalem";
const getYearAndMonthFromDate = (dateValue) => {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
  const error = new Error("Invalid date value on salary");
  error.code = "INVALID_SALARY_DATE_FOR_CACHE";
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
  error.code = "INVALID_SALARY_DATE_FOR_CACHE";
  throw error;
}
  return { year, month };
};

const createSalaryForUser = async (userId, data) => {
  const salaryObject = {
    userId,
    amount: data.amount,
    date: data.date
  };
  const createdSalary = await createSalary(salaryObject);
  try {
    const { year, month } = getYearAndMonthFromDate(createdSalary.date);
    await clearMonthlySummary(userId, year, month);
  }
  catch (err) {
  console.warn("Failed to clear monthly summary cache (salary)", err);
}
  return createdSalary;
}
const listSalariesForUser = async ({ userId, from, to, skip = 0, take = 50 }) => {
  const salaries = await listSalariesByUser({
    userId,
    from,
    to,
    skip,
    take,
  });
  return salaries;
};
const getSalaryForUser = async (userId, salaryId) => {
  const salary = await getSalaryById(salaryId);
  if (!salary || salary.userId !== userId) {
    const error = new Error("Salary not found");
    error.status = 404;
    error.code = "SALARY_NOT_FOUND";
    throw error;
  }
  return salary;
}
const updateSalaryForUser = async (userId, salaryId, data) => {
  const existSalary = await getSalaryById(salaryId);
  if (!existSalary || existSalary.userId !== userId) {
  const error = new Error("Salary not found");
  error.status = 404;
  error.code = "SALARY_NOT_FOUND";
  throw error;
}
  const updatedSalary = await updateSalary(salaryId, data);
  try {
    const { year: oldYear, month: oldMonth } =
    getYearAndMonthFromDate(existSalary.date);
    await clearMonthlySummary(userId, oldYear, oldMonth);

    const { year: newYear, month: newMonth } =
    getYearAndMonthFromDate(updatedSalary.date);
    if (oldYear !== newYear || oldMonth !== newMonth) {
      await clearMonthlySummary(userId, newYear, newMonth)
    }
  }
  catch (err) {
  console.warn("Failed to clear monthly summary cache (salary)", err);
}
  return updatedSalary;
}
  const deleteSalaryForUser = async (userId, salaryId) => {
  const exist = await getSalaryById(salaryId);
  if (!exist || exist.userId !== userId) {
    const error = new Error("Salary not found");
    error.status = 404;
    error.code = "SALARY_NOT_FOUND";
    throw error;
  }
  const deleted = await deleteSalary(salaryId);
  try {
    const { year, month} =
    getYearAndMonthFromDate(exist.date);
    await clearMonthlySummary(userId, year, month);
  }
  catch (err)
  {
  console.warn("Failed to clear monthly summary cache (salary)", err);
  }
  return deleted;
}

export {
  createSalaryForUser,
  listSalariesForUser,
  getSalaryForUser,
  updateSalaryForUser,
  deleteSalaryForUser,
};
