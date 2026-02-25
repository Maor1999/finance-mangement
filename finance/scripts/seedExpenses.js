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

const FIXED_DATE = new Date("2025-01-01T00:00:00.000Z");

const buildExpensesForUser = (userIndex) => {
const userId = `user${userIndex}`; 

const rentExpense = {
    userId,
    title: "Rent",
    category: "RENT",
    amount: getRandomAmount(1700, 3000), 
    date: FIXED_DATE,
};

const foodExpense = {
    userId,
    title: "Food",
    category: "FOOD",
    amount: getRandomAmount(700, 1500), 
    date: FIXED_DATE,
  };

const arnonaExpense = {
    userId,
    title: "Arnona",
    category: "ARNONA",
    amount: getRandomAmount(100, 300), 
    date: FIXED_DATE,
};

const gymExpense = {
    userId,
    title: "Gym membership",
    category: "OTHER",
    amount: getRandomAmount(200, 800),
    date: FIXED_DATE,
};

const clothesExpense = {
    userId,
    title: "Clothes",
    category: "OTHER",
    amount: getRandomAmount(200, 800),
    date: FIXED_DATE,
};

return [rentExpense, foodExpense, arnonaExpense, gymExpense, clothesExpense];
};

const main = async () => {
await prisma.expense.deleteMany({});
console.log("Cleared existing expenses");

const allExpenses = [];

for (let i = 1; i <= 100; i++) {
const userExpenses = buildExpensesForUser(i);
allExpenses.push(...userExpenses);
}

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
