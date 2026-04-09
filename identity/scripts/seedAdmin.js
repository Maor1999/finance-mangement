import prisma from "../prisma/prisma.js";
import { hashPassword } from "../services/passwordService.js";

const main = async () => {
  const passwordHash = await hashPassword("admin1234");

  const admin = await prisma.user.upsert({
    where: { email: "maor@admin.com" },
    update: { role: "ADMIN" },
    create: {
      fullName: "Maor",
      email: "maor@admin.com",
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log(`Admin ready: ${admin.fullName} (${admin.email})`);
};

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
