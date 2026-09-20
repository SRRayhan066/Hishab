import "server-only";
import { db } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth/session";
import { Prisma } from "@/lib/generated/prisma/client";
import { currentPeriod, periodLabel, type Period } from "./period";
import type { ExpenseEntry, MonthData, PastMonth } from "./types";

/** How many earlier months feed the history list and the savings total. */
const HISTORY_LIMIT = 12;

// Every budget row is ordered the same way: the order the user put them in,
// then oldest-first for anything that somehow shares a position.
const byOrder = [
  { sortOrder: "asc" },
  { createdAt: "asc" },
] satisfies Prisma.IncomeSourceOrderByWithRelationInput[];

export type MonthSnapshot = {
  monthId: string;
  period: Period;
  data: MonthData;
};

function isUniqueViolation(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

function monthKey(userId: string, { year, month }: Period) {
  return { userId_year_month: { userId, year, month } };
}

/**
 * The newest month this user has that sits before `period`. Skipped months are
 * never created, so coming back in December after last using the app in
 * September copies September — not an empty November.
 */
function findSeedMonth(userId: string, period: Period) {
  return db.budgetMonth.findFirst({
    where: {
      userId,
      OR: [
        { year: { lt: period.year } },
        { year: period.year, month: { lt: period.month } },
      ],
    },
    orderBy: [{ year: "desc" }, { month: "desc" }],
    select: {
      id: true,
      incomes: {
        select: { lineageId: true, name: true, amount: true, sortOrder: true },
        orderBy: byOrder,
      },
      categories: {
        select: { lineageId: true, name: true, budget: true, sortOrder: true },
        orderBy: byOrder,
      },
    },
  });
}

/**
 * Returns this month's id, creating the month the first time the user opens the
 * app in it. A new month is a copy of the previous one — names, amounts and
 * order carry forward, spending does not.
 */
export async function ensureCurrentMonth(
  userId: string,
  period: Period = currentPeriod(),
): Promise<string> {
  const existing = await db.budgetMonth.findUnique({
    where: monthKey(userId, period),
    select: { id: true },
  });
  if (existing) return existing.id;

  const seed = await findSeedMonth(userId, period);

  try {
    // One nested create, so a month is never half-copied.
    const created = await db.budgetMonth.create({
      data: {
        userId,
        year: period.year,
        month: period.month,
        seededFromId: seed?.id ?? null,
        incomes: seed?.incomes.length ? { create: seed.incomes } : undefined,
        categories: seed?.categories.length
          ? { create: seed.categories }
          : undefined,
      },
      select: { id: true },
    });
    return created.id;
  } catch (error) {
    // Two tabs opened on the 1st both tried to create it; the unique index on
    // (userId, year, month) let exactly one win. Use whichever row exists.
    if (!isUniqueViolation(error)) throw error;

    const raced = await db.budgetMonth.findUniqueOrThrow({
      where: monthKey(userId, period),
      select: { id: true },
    });
    return raced.id;
  }
}

type HistoryRow = {
  year: number;
  month: number;
  income: number;
  budget: number;
  spent: number;
};

/**
 * Past months, as totals only.
 *
 * Every screen needs these three numbers per month — the header's wallet
 * figure is built from them — but nothing needs the rows behind them. Reading
 * them through the ORM meant four queries and every expense row of the last
 * year crossing the wire on every page view; Postgres adds them up in one
 * round trip instead, which is the whole cost of the query on a mobile
 * connection.
 */
async function loadHistory(
  userId: string,
  period: Period,
): Promise<PastMonth[]> {
  const months = await db.$queryRaw<HistoryRow[]>`
    SELECT
      m."year",
      m."month",
      COALESCE(income.total, 0)::int AS income,
      COALESCE(plan.total, 0)::int   AS budget,
      COALESCE(spend.total, 0)::int  AS spent
    FROM "BudgetMonth" m
    LEFT JOIN LATERAL (
      SELECT SUM(i."amount") AS total
      FROM "IncomeSource" i
      WHERE i."monthId" = m."id"
    ) income ON TRUE
    LEFT JOIN LATERAL (
      SELECT SUM(c."budget") AS total
      FROM "SpendCategory" c
      WHERE c."monthId" = m."id"
    ) plan ON TRUE
    LEFT JOIN LATERAL (
      SELECT SUM(e."amount") AS total
      FROM "Expense" e
      JOIN "SpendCategory" c ON c."id" = e."categoryId"
      WHERE c."monthId" = m."id"
    ) spend ON TRUE
    WHERE m."userId" = ${userId}
      AND (
        m."year" < ${period.year}
        OR (m."year" = ${period.year} AND m."month" < ${period.month})
      )
    ORDER BY m."year" DESC, m."month" DESC
    LIMIT ${HISTORY_LIMIT}
  `;

  return months
    .map((month) => ({ ...month, label: periodLabel(month) }))
    // A month the user never set up would otherwise show as a flat ৳0 bar and
    // drag the history chart down with nothing to say.
    .filter(
      (month) =>
        month.income > 0 ||
        month.budget > 0 ||
        month.spent > 0,
    )
    .reverse();
}

/**
 * Everything the screens need for the current month, in one object.
 *
 * The queries are deliberately flat rather than one nested read: Prisma
 * resolves each level of a nested `select` with its own round trip, so the
 * nested version cost six trips in a row. These go out in two waves — the
 * rows that only need `userId`, then the rows that need the month's id — and
 * on a phone the round trips, not the work, are what the user waits for.
 */
export async function loadMonthSnapshot(
  userId: string,
  period: Period = currentPeriod(),
): Promise<MonthSnapshot> {
  const [monthId, user, history] = await Promise.all([
    ensureCurrentMonth(userId, period),
    db.user.findUniqueOrThrow({
      where: { id: userId },
      select: { openingBalance: true },
    }),
    loadHistory(userId, period),
  ]);

  const [income, categories, expenses] = await Promise.all([
    db.incomeSource.findMany({
      where: { monthId },
      select: { id: true, name: true, amount: true },
      orderBy: byOrder,
    }),
    db.spendCategory.findMany({
      where: { monthId },
      select: { id: true, name: true, budget: true },
      orderBy: byOrder,
    }),
    db.expense.findMany({
      where: { category: { monthId } },
      select: {
        id: true,
        categoryId: true,
        day: true,
        amount: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  // One pass instead of a `filter` per category, which is O(categories ×
  // expenses) by the end of a busy month.
  const entriesByCategory = new Map<string, ExpenseEntry[]>();
  for (const expense of expenses) {
    const entry: ExpenseEntry = {
      id: expense.id,
      day: expense.day,
      amount: expense.amount,
      addedAt: expense.createdAt.getTime(),
    };

    const existing = entriesByCategory.get(expense.categoryId);
    if (existing) existing.push(entry);
    else entriesByCategory.set(expense.categoryId, [entry]);
  }

  return {
    monthId,
    period,
    data: {
      openingBalance: user.openingBalance,
      income,
      categories: categories.map((category) => ({
        ...category,
        entries: entriesByCategory.get(category.id) ?? [],
      })),
      history,
    },
  };
}

/**
 * The current month for whoever is signed in, creating it if this is their
 * first visit of the month. `null` means no valid session — every action
 * checks this itself, because Server Actions are reachable by direct POST.
 */
export async function currentMonthForSession(): Promise<string | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;
  return ensureCurrentMonth(userId);
}

export type BudgetSection = "income" | "category";

/** Next `sortOrder` for a new row, so it lands at the bottom of its section. */
export async function nextSortOrder(
  section: BudgetSection,
  monthId: string,
): Promise<number> {
  const args = { where: { monthId }, _max: { sortOrder: true } } as const;

  const result =
    section === "income"
      ? await db.incomeSource.aggregate(args)
      : await db.spendCategory.aggregate(args);

  return (result._max.sortOrder ?? -1) + 1;
}
