import { formatTaka } from "./format";
import type { PastMonth } from "./types";

export type MonthResult = {
  /** Stable key — a Bengali month name alone repeats across years. */
  id: string;
  month: string;
  spent: number;
  budget: number;
  amount: number;
  label: string;
  word: string;
  tone: "good" | "over";
  percent: number;
};

export const signedTaka = (value: number) =>
  `${value >= 0 ? "+" : "−"}${formatTaka(Math.abs(value))}`;

export function buildMonthResults(history: PastMonth[]): MonthResult[] {
  const deltas = history.map((month) => month.budget - month.spent);

  // Bars are drawn against the biggest month either way, so a heavy overspend
  // reads as loud as a good month.
  const widest = Math.max(...deltas.map((delta) => Math.abs(delta)), 1);

  return history
    .map((month, index) => {
      const amount = deltas[index];

      return {
        id: `${month.year}-${month.month}`,
        month: month.label,
        spent: month.spent,
        budget: month.budget,
        amount,
        label: signedTaka(amount),
        word: amount >= 0 ? "বেঁচেছে" : "বেশি খরচ",
        tone: amount >= 0 ? ("good" as const) : ("over" as const),
        percent: Math.min(100, (Math.abs(amount) / widest) * 100),
      };
    })
    .reverse();
}
