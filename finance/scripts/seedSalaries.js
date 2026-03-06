import { prisma } from "../prisma/prisma.js";

const USERS_COUNT = 100;
const FIXED_DATE = new Date("2026-01-01T00:00:00.000Z");
const MIN_SALARY = 15000;
const MAX_SALARY = 25000;

const getRandomInt = (min, max) => {
  const minInt = Math.ceil(min);
  const maxInt = Math.floor(max);
  return Math.floor(Math.random() * (maxInt - minInt + 1)) + minInt;
};

const getRandomAmount = (min, max) => {
  const cents = getRandomInt(min * 100, max * 100);
  return (cents / 100).toFixed(2);
};

const hasSalaryForDate = async (userId, date) => {
  const existing = await prisma.salary.findFirst({
    where: {
      userId,
      date,
    },
    select: { id: true },
  });

  return Boolean(existing);
};

const main = async () => {
  let created = 0;
  let skipped = 0;

  for (let i = 1; i <= USERS_COUNT; i++) {
    const userId = `user${i}`;
    const exists = await hasSalaryForDate(userId, FIXED_DATE);

    if (exists) {
      skipped += 1;
      continue;
    }

    await prisma.salary.create({
      data: {
        userId,
        amount: getRandomAmount(MIN_SALARY, MAX_SALARY),
        date: FIXED_DATE,
      },
    });

    created += 1;
  }

  console.log(
    `Seed salaries finished. Created: ${created}, Skipped (already existed): ${skipped}`
  );
};

main()
  .catch((err) => {
    console.error("Seed salaries failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
