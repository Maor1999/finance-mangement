import prisma from "../prisma/prisma.js";
import { hashPassword } from "../services/passwordService.js";

const main = async () => {
  const users = await Promise.all(
    Array.from({ length: 100 }, async (_, i) => {
      const password = `password${i + 1}`;
      const passwordHash = await hashPassword(password);
      return {
        fullName: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        passwordHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    })
  );

  const result = await prisma.user.createMany({
    data: users,
    skipDuplicates: true,
  });

  console.log(`Seeded ${result.count} users.`);
};

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
