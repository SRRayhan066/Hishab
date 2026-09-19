import "server-only";
import { db } from "@/lib/db";
import { categoryHasExpensesError } from "./messages";
import type { PlanRow } from "@/lib/validation/finance";

/** A saved row as the form needs it back — with the id the database gave it. */
export type SavedRow = { id: string; name: string; amount: string };

export type SectionResult = { error?: string; rows?: SavedRow[] };

const asRows = (
  items: { id: string; name: string; amount: number }[],
): SavedRow[] =>
  items.map((item) => ({
    id: item.id,
    name: item.name,
    amount: String(item.amount),
  }));

type Change = {
  updates: { id: string; name: string; amount: number; sortOrder: number }[];
  creates: { name: string; amount: number; sortOrder: number }[];
  deletes: string[];
};

/**
 * Works out what a saved section means for the rows already in the database:
 * rows that came back with a known id are updates, rows without one are new,
 * and anything the user removed from the list is gone.
 */
function planChanges(existingIds: string[], rows: PlanRow[]): Change {
  const known = new Set(existingIds);
  const kept = new Set<string>();
  const updates: Change["updates"] = [];
  const creates: Change["creates"] = [];

  rows.forEach((row, index) => {
    const name = row.name.trim();

    // A row that was added and never filled in is not worth keeping.
    if (name === "" && row.amount === 0) return;

    if (row.id && known.has(row.id) && !kept.has(row.id)) {
      kept.add(row.id);
      updates.push({ id: row.id, name, amount: row.amount, sortOrder: index });
      return;
    }

    creates.push({ name, amount: row.amount, sortOrder: index });
  });

  return { updates, creates, deletes: existingIds.filter((id) => !kept.has(id)) };
}

export async function replaceIncomeSection(
  monthId: string,
  rows: PlanRow[],
): Promise<SectionResult> {
  const existing = await db.incomeSource.findMany({
    where: { monthId },
    select: { id: true },
  });
  const { updates, creates, deletes } = planChanges(
    existing.map((row) => row.id),
    rows,
  );

  await db.$transaction([
    ...(deletes.length
      ? [db.incomeSource.deleteMany({ where: { monthId, id: { in: deletes } } })]
      : []),
    ...updates.map(({ id, ...data }) =>
      db.incomeSource.update({ where: { id }, data }),
    ),
    ...creates.map((data) =>
      db.incomeSource.create({ data: { monthId, ...data } }),
    ),
  ]);

  // Hand the rows back so the form picks up the ids of everything just
  // created — otherwise a second save would create them all over again.
  const saved = await db.incomeSource.findMany({
    where: { monthId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: { id: true, name: true, amount: true },
  });

  return { rows: asRows(saved) };
}

export async function replaceCategorySection(
  monthId: string,
  rows: PlanRow[],
): Promise<SectionResult> {
  const existing = await db.spendCategory.findMany({
    where: { monthId },
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
      where: { monthId },
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
            where: { monthId, id: { in: deletes } },
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
    where: { monthId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: { id: true, name: true, budget: true },
  });

  return {
    rows: asRows(
      saved.map((row) => ({ id: row.id, name: row.name, amount: row.budget })),
    ),
  };
}
