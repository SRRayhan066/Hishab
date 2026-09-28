import "server-only";
import { db } from "@/lib/db";
import type { MoneyAccount } from "./types";

export async function loadAccounts(userId: string): Promise<MoneyAccount[]> {
  return db.$queryRaw<MoneyAccount[]>`
    SELECT
      a."id",
      a."name",
      a."openingBalance",
      a."color",
      a."icon",
      (
        a."openingBalance"
        + COALESCE(income.total, 0)
        - COALESCE(spend.total, 0)
        + COALESCE(incoming.total, 0)
        - COALESCE(outgoing.total, 0)
      )::int AS balance,
      (
        income.total IS NOT NULL
        OR spend.total IS NOT NULL
        OR incoming.total IS NOT NULL
        OR outgoing.total IS NOT NULL
      ) AS "inUse"
    FROM "MoneyAccount" a
    LEFT JOIN LATERAL (
      SELECT SUM(i."amount") AS total
      FROM "IncomeSource" i
      WHERE i."accountId" = a."id"
    ) income ON TRUE
    LEFT JOIN LATERAL (
      SELECT SUM(e."amount") AS total
      FROM "Expense" e
      WHERE e."accountId" = a."id"
    ) spend ON TRUE
    LEFT JOIN LATERAL (
      SELECT SUM(t."amount") AS total
      FROM "Transfer" t
      WHERE t."toId" = a."id"
    ) incoming ON TRUE
    LEFT JOIN LATERAL (
      SELECT SUM(t."amount") AS total
      FROM "Transfer" t
      WHERE t."fromId" = a."id"
    ) outgoing ON TRUE
    WHERE a."userId" = ${userId}
    ORDER BY a."sortOrder" ASC, a."createdAt" ASC
  `;
}

export async function ownedAccountIds(userId: string): Promise<string[]> {
  const accounts = await db.moneyAccount.findMany({
    where: { userId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: { id: true },
  });
  return accounts.map((account) => account.id);
}
