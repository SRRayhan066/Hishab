import type { FixedCost, IncomeSource, VariableCategory } from "@/lib/finance/types";

/** One editable line. `id` is empty until the row has been saved once. */
export type PlanRowField = {
  id: string;
  name: string;
  amount: string;
};

export type PlanFormValues = {
  income: PlanRowField[];
  fixed: PlanRowField[];
  categories: PlanRowField[];
};

export type PlanSectionName = keyof PlanFormValues;

export const blankRow = (): PlanRowField => ({ id: "", name: "", amount: "" });

export function toRowFields(
  items: (IncomeSource | FixedCost)[],
): PlanRowField[] {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    amount: String(item.amount),
  }));
}

export function toCategoryFields(
  categories: VariableCategory[],
): PlanRowField[] {
  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    amount: String(category.budget),
  }));
}

export function spentByCategory(
  categories: VariableCategory[],
): Record<string, number> {
  return Object.fromEntries(
    categories.map((category) => [
      category.id,
      category.entries.reduce((total, entry) => total + entry.amount, 0),
    ]),
  );
}

/** `useWatch` hands back partially-typed rows, so totals accept those too. */
export type WatchedRow = Partial<PlanRowField>;

export function fieldsTotal(rows: WatchedRow[] | undefined): number {
  if (!rows) return 0;

  return rows.reduce((total, row) => {
    const parsed = Number(row.amount);
    return total + (Number.isFinite(parsed) ? parsed : 0);
  }, 0);
}
