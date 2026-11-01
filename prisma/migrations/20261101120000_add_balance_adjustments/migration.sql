CREATE TABLE "BalanceAdjustment" (
    "id" TEXT NOT NULL,
    "monthId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "day" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BalanceAdjustment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "BalanceAdjustment_monthId_idx" ON "BalanceAdjustment"("monthId");
CREATE INDEX "BalanceAdjustment_accountId_idx" ON "BalanceAdjustment"("accountId");

ALTER TABLE "BalanceAdjustment" ADD CONSTRAINT "BalanceAdjustment_monthId_fkey" FOREIGN KEY ("monthId") REFERENCES "BudgetMonth"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BalanceAdjustment" ADD CONSTRAINT "BalanceAdjustment_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "MoneyAccount"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
