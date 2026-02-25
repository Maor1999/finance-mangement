/*
  Warnings:

  - You are about to alter the column `salaryAmount` on the `monthly_reports` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - You are about to alter the column `expenseTotal` on the `monthly_reports` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - You are about to alter the column `net` on the `monthly_reports` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - A unique constraint covering the columns `[userId,month,year]` on the table `monthly_reports` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "monthly_reports" ALTER COLUMN "salaryAmount" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "expenseTotal" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "net" SET DATA TYPE DECIMAL(12,2);

-- CreateIndex
CREATE UNIQUE INDEX "monthly_reports_userId_month_year_key" ON "monthly_reports"("userId", "month", "year");
