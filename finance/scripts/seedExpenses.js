import {prisma} from "../prisma/prisma.js";

const getRandomInt = (min, max) => {
  const minInt = Math.ceil(min);
  const maxInt = Math.floor(max);
  return Math.floor(Math.random() * (maxInt - minInt + 1)) + minInt;
};

const getRandomAmount = (min, max) => {
  const cents = getRandomInt(min * 100, max * 100);
  return (cents / 100).toFixed(2); 
};

const EXPENSE_TEMPLATES = [
  { title: "Rent", category: "RENT", min: 1700, max: 3000 },
  { title: "Food", category: "FOOD", min: 700, max: 1500 },
  { title: "Arnona", category: "ARNONA", min: 100, max: 300 },
  { title: "Gym membership", category: "OTHER", min: 200, max: 800 },
  { title: "Clothes", category: "OTHER", min: 200, max: 800 },
  { title: "Transportation", category: "OTHER", min: 100, max: 500 },
  { title: "Electricity", category: "OTHER", min: 100, max: 400 },
  { title: "Internet", category: "OTHER", min: 50, max: 200 },
  { title: "Phone", category: "OTHER", min: 50, max: 200 },
  { title: "Health insurance", category: "OTHER", min: 200, max: 600 },
  { title: "Entertainment", category: "OTHER", min: 100, max: 500 },
  { title: "Dining out", category: "FOOD", min: 200, max: 800 },
  { title: "Groceries", category: "FOOD", min: 300, max: 700 },
  { title: "Cleaning supplies", category: "OTHER", min: 50, max: 200 },
  { title: "Haircut", category: "OTHER", min: 50, max: 200 },
  { title: "Books", category: "OTHER", min: 50, max: 300 },
  { title: "Subscriptions", category: "OTHER", min: 50, max: 200 },
  { title: "Medical", category: "OTHER", min: 100, max: 500 },
  { title: "Parking", category: "OTHER", min: 100, max: 400 },
  { title: "Miscellaneous", category: "OTHER", min: 50, max: 300 },
];

const buildExpensesForUser = (userIndex) => {
  const userId = `user${userIndex}`;

  return Array.from({ length: 12 }, (_, month) =>
    Array.from({ length: 10 }, () =>
      EXPENSE_TEMPLATES.map((template) => ({
        userId,
        title: template.title,
        category: template.category,
        amount: getRandomAmount(template.min, template.max),
        date: new Date(2025, month, getRandomInt(1, 28)),
      }))
    ).flat()
  ).flat();
};

const main = async () => {
await prisma.expense.deleteMany({});
console.log("Cleared existing expenses");

const allExpenses = Array.from({ length: 100 }, (_, i) => buildExpensesForUser(i + 1)).flat();

const result = await prisma.expense.createMany({
data: allExpenses,
skipDuplicates: true,
});

console.log(`Seeded ${result.count} expenses for 100 users.`);
};

main()
.catch((err) => {
console.error("Seed expenses failed:", err);
process.exit(1);
})
.finally(async () => {
await prisma.$disconnect();
});
