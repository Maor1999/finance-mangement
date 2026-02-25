import { prisma } from "../prisma/prisma.js";

const createSalary = async (data) => {
    return prisma.salary.create({ data });
}

const getSalaryById = async (id) => {
    return prisma.salary.findUnique({
        where: { id }
    });
}

const listSalariesByUser = async ({
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

  return prisma.salary.findMany({
    where: { userId, ...dateFilter },
    orderBy: { date: "desc" },
    skip,
    take,
  });
};

const updateSalary = async (id, data) => {
  return prisma.salary.update({
    where: { id },
    data
  });
}

const deleteSalary = async (id) => {
  return prisma.salary.delete({
    where: { id }
  });
}

export {
  createSalary,
  getSalaryById,
  listSalariesByUser,
  updateSalary,
  deleteSalary,
};