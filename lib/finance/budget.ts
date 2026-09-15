import { formatTaka } from "./format";
import type { FixedCost, IncomeSource, VariableCategory } from "./types";

export type BudgetRow = {
  id: string;
  name: string;
  amount: string;
};

export type VariableBudgetRow = BudgetRow & {
  spent: number;
};

export type BudgetPlan = {
  incomeTotal: number;
  fixedTotal: number;
  variableBudget: number;
  planned: number;
  isBalanced: boolean;
  perDay: number;
  splitFixed: number;
  splitVariable: number;
  splitSavings: number;
  note: string;
};

const toAmount = (value: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export function toBudgetRows(
  items: (IncomeSource | FixedCost)[],
): BudgetRow[] {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    amount: String(item.amount),
  }));
}

export function toVariableRows(
  categories: VariableCategory[],
): VariableBudgetRow[] {
  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    amount: String(category.budget),
    spent: category.entries.reduce((total, entry) => total + entry.amount, 0),
  }));
}

export function rowsTotal(rows: BudgetRow[]): number {
  return rows.reduce((total, row) => total + toAmount(row.amount), 0);
}

export function patchRow<T extends BudgetRow>(
  rows: T[],
  id: string,
  patch: Partial<T>,
): T[] {
  return rows.map((row) => (row.id === id ? { ...row, ...patch } : row));
}

export function dropRow<T extends BudgetRow>(rows: T[], id: string): T[] {
  return rows.filter((row) => row.id !== id);
}

export function buildBudgetPlan(
  incomeTotal: number,
  fixedTotal: number,
  variableBudget: number,
  daysInMonth: number,
): BudgetPlan {
  const planned = incomeTotal - fixedTotal - variableBudget;
  const isBalanced = planned >= 0;

  // Widths are measured against whichever is larger — what comes in, or what
  // is already spoken for — so an over-allocated month fills the whole bar
  // instead of overflowing it.
  const base = Math.max(incomeTotal, fixedTotal + variableBudget, 1);

  return {
    incomeTotal,
    fixedTotal,
    variableBudget,
    planned,
    isBalanced,
    perDay: daysInMonth > 0 ? variableBudget / daysInMonth : variableBudget,
    splitFixed: (fixedTotal / base) * 100,
    splitVariable: (variableBudget / base) * 100,
    splitSavings: (Math.max(planned, 0) / base) * 100,
    note: isBalanced
      ? `হিসাব মিলেছে। সব ঠিক থাকলে মাস শেষে ${formatTaka(planned)} জমাতে পারবে।`
      : `আয়ের চেয়ে খরচ ${formatTaka(-planned)} বেশি ধরা হয়েছে। কোনো খাত একটু কমাতে হবে।`,
  };
}
