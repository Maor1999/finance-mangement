import { prisma } from "../prisma/prisma.js";

const createExpense = async (data) => {
    return prisma.expense.create({ data });
}

const getExpenseById = async (id) => {
    return prisma.expense.findUnique({
        where: { id },
    });
}

const listExpensesByUser = async ({
  userId,
  from,
  to,
  skip = 0,
  take = 50,
}) => {
  const dateFilter =
    from || to
      ? {
          date: {
            ...(from ? { gte: from } : {}),
            ...(to ? { lte: to } : {}),
          },
        }
      : {};

  return prisma.expense.findMany({
    where: {
      userId,
      ...dateFilter,
    },
    orderBy: { date: "desc" },
    skip,
    take,
  });
};

const updateExpense = async (id, data) => {
  return prisma.expense.update({
    where: { id },
    data
  });
};

const deleteExpense = async (id) => {
  return prisma.expense.delete({
    where: { id },
  });
}
  
const listAllExpenses = async ({ from, to, skip = 0, take = 50 } = {}) => {
  const dateFilter =
    from || to
      ? { date: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } }
      : {};

  return prisma.expense.findMany({
    where: { ...dateFilter },
    orderBy: { date: "desc" },
    skip,
    take,
  });
};

export {
  createExpense,
  getExpenseById,
  listExpensesByUser,
  listAllExpenses,
  updateExpense,
  deleteExpense,
};