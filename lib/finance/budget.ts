import { formatTaka } from "./format";

export type BudgetPlan = {
  incomeTotal: number;
  plannedTotal: number;
  /** What the month is forecast to leave behind, if the plan holds. */
  leftOver: number;
  isBalanced: boolean;
  perDay: number;
  splitPlanned: number;
  splitLeftOver: number;
  note: string;
};

/**
 * The month on paper: what is expected in, what is planned out, and what that
 * leaves. Nothing here reflects real spending — that lives on the expense
 * page and moves the balance, not this plan.
 */
export function buildBudgetPlan(
  incomeTotal: number,
  plannedTotal: number,
  daysInMonth: number,
): BudgetPlan {
  const leftOver = incomeTotal - plannedTotal;
  const isBalanced = leftOver >= 0;

  // Widths are measured against whichever is larger — what comes in, or what
  // is already spoken for — so an over-allocated month fills the whole bar
  // instead of overflowing it.
  const base = Math.max(incomeTotal, plannedTotal, 1);

  return {
    incomeTotal,
    plannedTotal,
    leftOver,
    isBalanced,
    perDay: daysInMonth > 0 ? plannedTotal / daysInMonth : plannedTotal,
    splitPlanned: (plannedTotal / base) * 100,
    splitLeftOver: (Math.max(leftOver, 0) / base) * 100,
    note: isBalanced
      ? `সব মিলে গেছে! বাজেট মেনে চললে মাস শেষে ${formatTaka(leftOver)} হাতে থাকবে।`
      : `আয়ের চেয়ে ${formatTaka(-leftOver)} বেশি খরচ ধরে ফেলেছো। কোথাও একটু কাটছাঁট করো।`,
  };
}
