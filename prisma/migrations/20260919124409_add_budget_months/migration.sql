-- AlterTable
ALTER TABLE "User" ADD COLUMN     "openingSavings" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "BudgetMonth" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "seededFromId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BudgetMonth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IncomeSource" (
    "id" TEXT NOT NULL,
    "monthId" TEXT NOT NULL,
    "lineageId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 0,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IncomeSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FixedCost" (
    "id" TEXT NOT NULL,
    "monthId" TEXT NOT NULL,
    "lineageId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 0,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FixedCost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpendCategory" (
    "id" TEXT NOT NULL,
    "monthId" TEXT NOT NULL,
    "lineageId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "budget" INTEGER NOT NULL DEFAULT 0,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpendCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "day" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BudgetMonth_userId_year_month_idx" ON "BudgetMonth"("userId", "year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "BudgetMonth_userId_year_month_key" ON "BudgetMonth"("userId", "year", "month");

-- CreateIndex
CREATE INDEX "IncomeSource_monthId_idx" ON "IncomeSource"("monthId");

-- CreateIndex
CREATE INDEX "IncomeSource_lineageId_idx" ON "IncomeSource"("lineageId");

-- CreateIndex
CREATE INDEX "FixedCost_monthId_idx" ON "FixedCost"("monthId");

-- CreateIndex
CREATE INDEX "FixedCost_lineageId_idx" ON "FixedCost"("lineageId");

-- CreateIndex
CREATE INDEX "SpendCategory_monthId_idx" ON "SpendCategory"("monthId");

-- CreateIndex
CREATE INDEX "SpendCategory_lineageId_idx" ON "SpendCategory"("lineageId");

-- CreateIndex
CREATE INDEX "Expense_categoryId_idx" ON "Expense"("categoryId");

-- AddForeignKey
ALTER TABLE "BudgetMonth" ADD CONSTRAINT "BudgetMonth_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetMonth" ADD CONSTRAINT "BudgetMonth_seededFromId_fkey" FOREIGN KEY ("seededFromId") REFERENCES "BudgetMonth"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncomeSource" ADD CONSTRAINT "IncomeSource_monthId_fkey" FOREIGN KEY ("monthId") REFERENCES "BudgetMonth"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FixedCost" ADD CONSTRAINT "FixedCost_monthId_fkey" FOREIGN KEY ("monthId") REFERENCES "BudgetMonth"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpendCategory" ADD CONSTRAINT "SpendCategory_monthId_fkey" FOREIGN KEY ("monthId") REFERENCES "BudgetMonth"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "SpendCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
