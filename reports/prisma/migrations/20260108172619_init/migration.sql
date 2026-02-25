/*
  Warnings:

  - You are about to drop the column `salaryAmount` on the `monthly_reports` table. All the data in the column will be lost.
  - Added the required column `salaryTotal` to the `monthly_reports` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "monthly_reports" DROP COLUMN "salaryAmount",
ADD COLUMN     "salaryTotal" DECIMAL(12,2) NOT NULL;
