CREATE TABLE "MoneyAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "openingBalance" INTEGER NOT NULL DEFAULT 0,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MoneyAccount_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Transfer" (
    "id" TEXT NOT NULL,
    "monthId" TEXT NOT NULL,
    "fromId" TEXT NOT NULL,
    "toId" TEXT NOT NULL,
    "day" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transfer_pkey" PRIMARY KEY ("id")
);

INSERT INTO "MoneyAccount" ("id", "userId", "name", "openingBalance", "updatedAt")
SELECT gen_random_uuid()::text, "id", 'ক্যাশ', "openingBalance", CURRENT_TIMESTAMP
FROM "User";

ALTER TABLE "IncomeSource" ADD COLUMN "accountId" TEXT;
ALTER TABLE "Expense" ADD COLUMN "accountId" TEXT;

UPDATE "IncomeSource" i
SET "accountId" = a."id"
FROM "BudgetMonth" m, "MoneyAccount" a
WHERE m."id" = i."monthId" AND a."userId" = m."userId";

UPDATE "Expense" e
SET "accountId" = a."id"
FROM "SpendCategory" c, "BudgetMonth" m, "MoneyAccount" a
WHERE c."id" = e."categoryId" AND m."id" = c."monthId" AND a."userId" = m."userId";

ALTER TABLE "IncomeSource" ALTER COLUMN "accountId" SET NOT NULL;
ALTER TABLE "Expense" ALTER COLUMN "accountId" SET NOT NULL;

ALTER TABLE "User" DROP COLUMN "openingBalance";

CREATE INDEX "MoneyAccount_userId_idx" ON "MoneyAccount"("userId");
CREATE INDEX "Transfer_monthId_idx" ON "Transfer"("monthId");
CREATE INDEX "Transfer_fromId_idx" ON "Transfer"("fromId");
CREATE INDEX "Transfer_toId_idx" ON "Transfer"("toId");
CREATE INDEX "IncomeSource_accountId_idx" ON "IncomeSource"("accountId");
CREATE INDEX "Expense_accountId_idx" ON "Expense"("accountId");

ALTER TABLE "MoneyAccount" ADD CONSTRAINT "MoneyAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "IncomeSource" ADD CONSTRAINT "IncomeSource_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "MoneyAccount"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "MoneyAccount"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_monthId_fkey" FOREIGN KEY ("monthId") REFERENCES "BudgetMonth"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "MoneyAccount"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_toId_fkey" FOREIGN KEY ("toId") REFERENCES "MoneyAccount"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
