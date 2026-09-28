import "server-only";
import { db } from "@/lib/db";
import { Prisma } from "@/lib/generated/prisma/client";
import type { MoneyAccount } from "./types";

export type MoneyTx = Parameters<Parameters<typeof db.$transaction>[0]>[0];

type RawClient = Pick<MoneyTx, "$queryRaw">;

function selectAccounts(
  client: RawClient,
  where: Prisma.Sql,
): Promise<MoneyAccount[]> {
  return client.$queryRaw<MoneyAccount[]>`
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
    WHERE ${where}
    ORDER BY a."sortOrder" ASC, a."createdAt" ASC
  `;
}

export async function loadAccounts(userId: string): Promise<MoneyAccount[]> {
  return selectAccounts(db, Prisma.sql`a."userId" = ${userId}`);
}

export function moneyTransaction<T>(
  run: (tx: MoneyTx) => Promise<T>,
): Promise<T> {
  return db.$transaction(run, { maxWait: 15_000, timeout: 15_000 });
}

export async function lockBalances(
  tx: MoneyTx,
  userId: string,
  accountIds?: string[],
): Promise<MoneyAccount[]> {
  const where = accountIds
    ? Prisma.sql`a."userId" = ${userId} AND a."id" IN (${Prisma.join(
        accountIds.length ? [...new Set(accountIds)] : [""],
      )})`
    : Prisma.sql`a."userId" = ${userId}`;

  await tx.$queryRaw`
    SELECT a."id"
    FROM "MoneyAccount" a
    WHERE ${where}
    ORDER BY a."id"
    FOR UPDATE
  `;

  return selectAccounts(tx, where);
}

export async function ownedAccountIds(userId: string): Promise<string[]> {
  const accounts = await db.moneyAccount.findMany({
    where: { userId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: { id: true },
  });
  return accounts.map((account) => account.id);
}
