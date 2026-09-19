import "server-only";
import { db } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth/session";
import { Prisma } from "@/lib/generated/prisma/client";
import { currentPeriod, periodLabel, type Period } from "./period";
import type { MonthData, PastMonth } from "./types";

/** How many earlier months feed the history list and the savings total. */
const HISTORY_LIMIT = 12;

// Every budget row is ordered the same way: the order the user put them in,
// then oldest-first for anything that somehow shares a position.
const byOrder = [
  { sortOrder: "asc" },
  { createdAt: "asc" },
] satisfies Prisma.IncomeSourceOrderByWithRelationInput[];

const planSelect = {
  id: true,
  year: true,
  month: true,
  incomes: {
    select: { id: true, name: true, amount: true },
    orderBy: byOrder,
  },
  fixedCosts: {
    select: { id: true, name: true, amount: true },
    orderBy: byOrder,
  },
  categories: {
    select: {
      id: true,
      name: true,
      budget: true,
      expenses: {
        select: { id: true, day: true, amount: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: byOrder,
  },
} satisfies Prisma.BudgetMonthSelect;

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
      fixedCosts: {
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
        fixedCosts: seed?.fixedCosts.length
          ? { create: seed.fixedCosts }
          : undefined,
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

async function loadHistory(
  userId: string,
  period: Period,
): Promise<PastMonth[]> {
  const months = await db.budgetMonth.findMany({
    where: {
      userId,
      OR: [
        { year: { lt: period.year } },
        { year: period.year, month: { lt: period.month } },
      ],
    },
    orderBy: [{ year: "desc" }, { month: "desc" }],
    take: HISTORY_LIMIT,
    select: {
      year: true,
      month: true,
      incomes: { select: { amount: true } },
      fixedCosts: { select: { amount: true } },
      categories: {
        select: { budget: true, expenses: { select: { amount: true } } },
      },
    },
  });

  return months
    .map((month) => ({
      year: month.year,
      month: month.month,
      label: periodLabel(month),
      income: month.incomes.reduce((total, row) => total + row.amount, 0),
      fixed: month.fixedCosts.reduce((total, row) => total + row.amount, 0),
      budget: month.categories.reduce((total, c) => total + c.budget, 0),
      spent: month.categories.reduce(
        (total, c) => total + c.expenses.reduce((sum, e) => sum + e.amount, 0),
        0,
      ),
    }))
    // A month the user never set up would otherwise show as a flat ৳0 bar and
    // drag the history chart down with nothing to say.
    .filter(
      (month) =>
        month.income > 0 ||
        month.fixed > 0 ||
        month.budget > 0 ||
        month.spent > 0,
    )
    .reverse();
}

/** Everything the screens need for the current month, in one object. */
export async function loadMonthSnapshot(
  userId: string,
  period: Period = currentPeriod(),
): Promise<MonthSnapshot> {
  const monthId = await ensureCurrentMonth(userId, period);

  const [month, user, history] = await Promise.all([
    db.budgetMonth.findUniqueOrThrow({
      where: { id: monthId },
      select: planSelect,
    }),
    db.user.findUniqueOrThrow({
      where: { id: userId },
      select: { openingSavings: true },
    }),
    loadHistory(userId, period),
  ]);

  return {
    monthId,
    period,
    data: {
      openingSavings: user.openingSavings,
      income: month.incomes,
      fixed: month.fixedCosts,
      variable: month.categories.map((category) => ({
        id: category.id,
        name: category.name,
        budget: category.budget,
        entries: category.expenses.map((expense) => ({
          id: expense.id,
          day: expense.day,
          amount: expense.amount,
          addedAt: expense.createdAt.getTime(),
        })),
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

export type BudgetSection = "income" | "fixed" | "category";

/** Next `sortOrder` for a new row, so it lands at the bottom of its section. */
export async function nextSortOrder(
  section: BudgetSection,
  monthId: string,
): Promise<number> {
  const args = { where: { monthId }, _max: { sortOrder: true } } as const;

  const result =
    section === "income"
      ? await db.incomeSource.aggregate(args)
      : section === "fixed"
        ? await db.fixedCost.aggregate(args)
        : await db.spendCategory.aggregate(args);

  return (result._max.sortOrder ?? -1) + 1;
}
