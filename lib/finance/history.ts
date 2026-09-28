import type { PastMonth } from "./types";

export type MonthResult = {
  /** Stable key — a month name alone repeats across years. */
  id: string;
  /** 1–12. */
  month: number;
  spent: number;
  budget: number;
  amount: number;
  tone: "good" | "over";
  percent: number;
};

/**
 * How much money the month actually left behind: what came in, less every
 * taka that really went out. This is what moves the balance.
 */
export const monthSaving = (month: PastMonth) => month.income - month.spent;

/**
 * Whether the month's plan was respected. A different question from
 * `monthSaving` — a month can keep to its plan and still lose money.
 */
export const monthUnderBudget = (month: PastMonth) => month.budget - month.spent;

function buildResults(
  history: PastMonth[],
  amountOf: (month: PastMonth) => number,
): MonthResult[] {
  const amounts = history.map(amountOf);

  // Bars are drawn against the biggest month either way, so a heavy overspend
  // reads as loud as a good month.
  const widest = Math.max(...amounts.map((amount) => Math.abs(amount)), 1);

  return history
    .map((month, index) => {
      const amount = amounts[index];

      return {
        id: `${month.year}-${month.month}`,
        month: month.month,
        spent: month.spent,
        budget: month.budget,
        amount,
        tone: amount >= 0 ? ("good" as const) : ("over" as const),
        percent: Math.min(100, (Math.abs(amount) / widest) * 100),
      };
    })
    .reverse();
}

/** For the history screen: did the hand-cash budget hold? */
export function buildMonthResults(history: PastMonth[]): MonthResult[] {
  return buildResults(history, monthUnderBudget);
}

/** For the savings screen: how much did each month actually put away? */
export function buildSavingsResults(history: PastMonth[]): MonthResult[] {
  return buildResults(history, monthSaving);
}
