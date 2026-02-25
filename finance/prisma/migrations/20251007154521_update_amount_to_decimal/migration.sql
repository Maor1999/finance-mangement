/*
  Warnings:

  - You are about to alter the column `amount` on the `expenses` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - You are about to drop the column `validFrom` on the `salaries` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `salaries` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - Added the required column `date` to the `salaries` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "expenses" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "salaries" DROP COLUMN "validFrom",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(12,2);
