ALTER TABLE "User" ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'BDT';

CREATE TYPE "DebtKind" AS ENUM ('lend', 'borrow', 'gotBack', 'paidBack');

CREATE TABLE "DebtPerson" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DebtPerson_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DebtEntry" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "monthId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "kind" "DebtKind" NOT NULL,
    "day" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DebtEntry_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DebtPerson_userId_name_key" ON "DebtPerson"("userId", "name");
CREATE INDEX "DebtPerson_userId_idx" ON "DebtPerson"("userId");
CREATE INDEX "DebtEntry_personId_idx" ON "DebtEntry"("personId");
CREATE INDEX "DebtEntry_monthId_idx" ON "DebtEntry"("monthId");
CREATE INDEX "DebtEntry_accountId_idx" ON "DebtEntry"("accountId");

ALTER TABLE "DebtPerson" ADD CONSTRAINT "DebtPerson_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DebtEntry" ADD CONSTRAINT "DebtEntry_personId_fkey" FOREIGN KEY ("personId") REFERENCES "DebtPerson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DebtEntry" ADD CONSTRAINT "DebtEntry_monthId_fkey" FOREIGN KEY ("monthId") REFERENCES "BudgetMonth"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DebtEntry" ADD CONSTRAINT "DebtEntry_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "MoneyAccount"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
