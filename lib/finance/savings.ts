import { formatTaka } from "./format";
import type { PastMonth } from "./types";

export type SavingsMonth = {
  month: string;
  amount: number;
  label: string;
  word: string;
  tone: "good" | "over";
  percent: number;
};

export type SavingsView = {
  opening: number;
  pastSaved: number;
  pastSavedLabel: string;
  total: number;
  thisMonth: number;
  sentence: string;
  months: SavingsMonth[];
};

const signed = (value: number) =>
  `${value >= 0 ? "+" : "−"}${formatTaka(Math.abs(value))}`;

export function buildSavingsView(
  opening: number,
  history: PastMonth[],
  thisMonthSaving: number,
): SavingsView {
  const deltas = history.map((month) => month.budget - month.spent);
  const pastSaved = deltas.reduce((total, delta) => total + delta, 0);

  // Bars are drawn against the biggest month either way, so a heavy overspend
  // reads as loud as a good month.
  const widest = Math.max(...deltas.map((delta) => Math.abs(delta)), 1);

  const months: SavingsMonth[] = history
    .map((month, index) => {
      const amount = deltas[index];

      return {
        month: month.month,
        amount,
        label: signed(amount),
        word: amount >= 0 ? "বেঁচেছে" : "বেশি খরচ",
        tone: amount >= 0 ? ("good" as const) : ("over" as const),
        percent: Math.min(100, (Math.abs(amount) / widest) * 100),
      };
    })
    .reverse();

  return {
    opening,
    pastSaved,
    pastSavedLabel: signed(pastSaved),
    total: opening + pastSaved,
    thisMonth: thisMonthSaving,
    sentence:
      thisMonthSaving >= 0
        ? `প্রতি মাসে যা বেঁচে যায় সেটা এর সাথে যোগ হয়। এই মাসে এখনকার খরচের গতি ধরলে ${formatTaka(thisMonthSaving)} যোগ হবে।`
        : `প্রতি মাসে যা বেঁচে যায় সেটা এর সাথে যোগ হয়। তবে এখনকার খরচের গতি ধরলে এই মাসে জমার বদলে ${formatTaka(-thisMonthSaving)} কমে যাবে।`,
    months,
  };
}
