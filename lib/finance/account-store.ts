import "server-only";
import { db } from "@/lib/db";
import { Prisma } from "@/lib/generated/prisma/client";
import { getT } from "@/lib/i18n/server";
import { APP_TIME_ZONE, currentPeriod, periodKey, type Period } from "./period";
import type { MoneyAccount } from "./types";

export type MoneyTx = Parameters<Parameters<typeof db.$transaction>[0]>[0];

type RawClient = Pick<MoneyTx, "$queryRaw">;

const openedMonth = Prisma.sql`to_char(
  a."createdAt" AT TIME ZONE 'UTC' AT TIME ZONE ${Prisma.raw(`'${APP_TIME_ZONE}'`)},
  'YYYY-MM'
)`;

function selectAccounts(
  client: RawClient,
  where: Prisma.Sql,
  asOf?: Period,
): Promise<MoneyAccount[]> {
  const upToMonth = (monthId: Prisma.Sql) =>
    asOf
      ? Prisma.sql`AND EXISTS (
          SELECT 1
          FROM "BudgetMonth" m
          WHERE m."id" = ${monthId}
            AND (
              m."year" < ${asOf.year}
              OR (m."year" = ${asOf.year} AND m."month" <= ${asOf.month})
            )
        )`
      : Prisma.empty;

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
        + COALESCE(adjusted.total, 0)
      )::int AS balance,
      (
        income.total IS NOT NULL
        OR spend.total IS NOT NULL
        OR incoming.total IS NOT NULL
        OR outgoing.total IS NOT NULL
        OR adjusted.total IS NOT NULL
      ) AS "inUse",
      (${openedMonth} < ${periodKey(currentPeriod())}) AS "openingLocked"
    FROM "MoneyAccount" a
    LEFT JOIN LATERAL (
      SELECT SUM(i."amount") AS total
      FROM "IncomeSource" i
      WHERE i."accountId" = a."id"
        ${upToMonth(Prisma.sql`i."monthId"`)}
    ) income ON TRUE
    LEFT JOIN LATERAL (
      SELECT SUM(e."amount") AS total
      FROM "Expense" e
      WHERE e."accountId" = a."id"
        ${upToMonth(Prisma.sql`(SELECT c."monthId" FROM "SpendCategory" c WHERE c."id" = e."categoryId")`)}
    ) spend ON TRUE
    LEFT JOIN LATERAL (
      SELECT SUM(t."amount") AS total
      FROM "Transfer" t
      WHERE t."toId" = a."id"
        ${upToMonth(Prisma.sql`t."monthId"`)}
    ) incoming ON TRUE
    LEFT JOIN LATERAL (
      SELECT SUM(t."amount") AS total
      FROM "Transfer" t
      WHERE t."fromId" = a."id"
        ${upToMonth(Prisma.sql`t."monthId"`)}
    ) outgoing ON TRUE
    LEFT JOIN LATERAL (
      SELECT SUM(b."amount") AS total
      FROM "BalanceAdjustment" b
      WHERE b."accountId" = a."id"
        ${upToMonth(Prisma.sql`b."monthId"`)}
    ) adjusted ON TRUE
    WHERE ${where}
    ORDER BY a."sortOrder" ASC, a."createdAt" ASC
  `;
}

export async function defaultMoneyAccount() {
  const t = await getT("common");
  return { name: t("defaultAccount") };
}

export async function loadAccounts(
  userId: string,
  asOf?: Period,
): Promise<MoneyAccount[]> {
  const owned = Prisma.sql`a."userId" = ${userId}`;
  return selectAccounts(
    db,
    asOf
      ? Prisma.sql`${owned} AND ${openedMonth} <= ${periodKey(asOf)}`
      : owned,
    asOf,
  );
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
