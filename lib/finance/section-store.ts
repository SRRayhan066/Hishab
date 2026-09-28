import "server-only";
import { db } from "@/lib/db";
import {
  accountGoneError,
  accountInUseError,
  categoryHasExpensesError,
  lastAccountError,
} from "./messages";
import type { AccountRow, PlanRow } from "@/lib/validation/finance";

/** A saved row as the form needs it back — with the id the database gave it. */
export type SavedRow = {
  id: string;
  name: string;
  amount: string;
  accountId?: string;
  color?: string;
  icon?: string;
};

export type SectionResult = { error?: string; rows?: SavedRow[] };

const asRows = (
  items: {
    id: string;
    name: string;
    amount: number;
    accountId?: string;
    color?: string;
    icon?: string;
  }[],
): SavedRow[] =>
  items.map(({ amount, ...item }) => ({ ...item, amount: String(amount) }));

type RowData = {
  name: string;
  amount: number;
  sortOrder: number;
  accountId?: string;
  color?: string;
  icon?: string;
};

type Change = {
  updates: (RowData & { id: string })[];
  creates: RowData[];
  deletes: string[];
};

/**
 * Works out what a saved section means for the rows already in the database:
 * rows that came back with a known id are updates, rows without one are new,
 * and anything the user removed from the list is gone.
 */
function planChanges(
  existingIds: string[],
  rows: (PlanRow | AccountRow)[],
): Change {
  const known = new Set(existingIds);
  const kept = new Set<string>();
  const updates: Change["updates"] = [];
  const creates: Change["creates"] = [];

  rows.forEach((row, index) => {
    const name = row.name.trim();

    // A row that was added and never filled in is not worth keeping.
    if (name === "" && row.amount === 0) return;

    const data: RowData = {
      name,
      amount: row.amount,
      sortOrder: index,
      ...("accountId" in row && row.accountId
        ? { accountId: row.accountId }
        : {}),
      ...("color" in row && row.color ? { color: row.color } : {}),
      ...("icon" in row && row.icon ? { icon: row.icon } : {}),
    };

    if (row.id && known.has(row.id) && !kept.has(row.id)) {
      kept.add(row.id);
      updates.push({ id: row.id, ...data });
      return;
    }

    creates.push(data);
  });

  return { updates, creates, deletes: existingIds.filter((id) => !kept.has(id)) };
}

export async function replaceIncomeSection(
  monthId: string,
  accountIds: string[],
  rows: PlanRow[],
): Promise<SectionResult> {
  const owned = new Set(accountIds);
  if (rows.some((row) => row.accountId && !owned.has(row.accountId))) {
    return { error: accountGoneError };
  }

  const existing = await db.incomeSource.findMany({
    where: { monthId },
    select: { id: true },
  });
  const { updates, creates, deletes } = planChanges(
    existing.map((row) => row.id),
    rows,
  );
  const withAccount = ({ name, amount, sortOrder, accountId }: RowData) => ({
    name,
    amount,
    sortOrder,
    accountId: accountId ?? accountIds[0],
  });

  await db.$transaction([
    ...(deletes.length
      ? [db.incomeSource.deleteMany({ where: { monthId, id: { in: deletes } } })]
      : []),
    ...updates.map(({ id, ...data }) =>
      db.incomeSource.update({ where: { id }, data: withAccount(data) }),
    ),
    ...creates.map((data) =>
      db.incomeSource.create({ data: { monthId, ...withAccount(data) } }),
    ),
  ]);

  // Hand the rows back so the form picks up the ids of everything just
  // created — otherwise a second save would create them all over again.
  const saved = await db.incomeSource.findMany({
    where: { monthId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: { id: true, name: true, amount: true, accountId: true },
  });

  return { rows: asRows(saved) };
}

export async function replaceCategorySection(
  monthId: string,
  rows: PlanRow[],
): Promise<SectionResult> {
  // Temporary categories never reach the budget form, so they are left out
  // here too — otherwise every save would read them as deleted.
  const planned = { monthId, temporary: false };

  const existing = await db.spendCategory.findMany({
    where: planned,
    select: { id: true, _count: { select: { expenses: true } } },
  });
  const { updates, creates, deletes } = planChanges(
    existing.map((row) => row.id),
    rows,
  );

  // Dropping a category would take this month's spending records with it, so
  // the whole save is refused rather than quietly losing them.
  const spentOn = existing.filter(
    (row) => deletes.includes(row.id) && row._count.expenses > 0,
  );
  if (spentOn.length > 0) {
    // Nothing is written, so send the untouched section back — otherwise the
    // form keeps showing a row as deleted when it is still there.
    const current = await db.spendCategory.findMany({
      where: planned,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: { id: true, name: true, budget: true },
    });

    return {
      error: categoryHasExpensesError,
      rows: asRows(
        current.map((row) => ({
          id: row.id,
          name: row.name,
          amount: row.budget,
        })),
      ),
    };
  }

  await db.$transaction([
    ...(deletes.length
      ? [
          db.spendCategory.deleteMany({
            where: { ...planned, id: { in: deletes } },
          }),
        ]
      : []),
    ...updates.map(({ id, name, amount, sortOrder }) =>
      db.spendCategory.update({
        where: { id },
        data: { name, budget: amount, sortOrder },
      }),
    ),
    ...creates.map(({ name, amount, sortOrder }) =>
      db.spendCategory.create({
        data: { monthId, name, budget: amount, sortOrder },
      }),
    ),
  ]);

  const saved = await db.spendCategory.findMany({
    where: planned,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: { id: true, name: true, budget: true },
  });

  return {
    rows: asRows(
      saved.map((row) => ({ id: row.id, name: row.name, amount: row.budget })),
    ),
  };
}

async function savedAccountRows(userId: string): Promise<SavedRow[]> {
  const accounts = await db.moneyAccount.findMany({
    where: { userId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: { id: true, name: true, openingBalance: true, color: true, icon: true },
  });

  return asRows(
    accounts.map(({ openingBalance, ...account }) => ({
      ...account,
      amount: openingBalance,
    })),
  );
}

export async function replaceAccountSection(
  userId: string,
  rows: AccountRow[],
): Promise<SectionResult> {
  const existing = await db.moneyAccount.findMany({
    where: { userId },
    select: {
      id: true,
      _count: {
        select: {
          incomes: true,
          expenses: true,
          transfersIn: true,
          transfersOut: true,
        },
      },
    },
  });
  const { updates, creates, deletes } = planChanges(
    existing.map((row) => row.id),
    rows,
  );

  if (updates.length + creates.length === 0) {
    return { error: lastAccountError, rows: await savedAccountRows(userId) };
  }

  const inUse = existing.some(
    ({ id, _count }) =>
      deletes.includes(id) &&
      _count.incomes + _count.expenses + _count.transfersIn + _count.transfersOut > 0,
  );
  if (inUse) {
    return { error: accountInUseError, rows: await savedAccountRows(userId) };
  }

  await db.$transaction([
    ...(deletes.length
      ? [db.moneyAccount.deleteMany({ where: { userId, id: { in: deletes } } })]
      : []),
    ...updates.map(({ id, name, amount, sortOrder, color, icon }) =>
      db.moneyAccount.update({
        where: { id },
        data: { name, openingBalance: amount, sortOrder, color, icon },
      }),
    ),
    ...creates.map(({ name, amount, sortOrder, color, icon }) =>
      db.moneyAccount.create({
        data: { userId, name, openingBalance: amount, sortOrder, color, icon },
      }),
    ),
  ]);

  return { rows: await savedAccountRows(userId) };
}
