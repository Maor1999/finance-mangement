-- CreateTable
CREATE TABLE "monthly_reports" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "salaryAmount" DOUBLE PRECISION NOT NULL,
    "expenseTotal" DOUBLE PRECISION NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "net" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "monthly_reports_pkey" PRIMARY KEY ("id")
);
