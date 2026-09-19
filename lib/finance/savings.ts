import { formatTaka } from "./format";
import { buildSavingsResults, monthSaving, signedTaka, type MonthResult } from "./history";
import type { PastMonth } from "./types";

export type SavingsView = {
  opening: number;
  pastSaved: number;
  pastSavedLabel: string;
  /** Opening + every past month + this month so far. The wallet, in other words. */
  total: number;
  /** Actually banked this month: what came in, less what has gone out. */
  thisMonth: number;
  /** Where this month lands if the current spending pace holds. */
  projected: number;
  sentence: string;
  months: MonthResult[];
};

export function buildSavingsView(
  opening: number,
  history: PastMonth[],
  thisMonth: number,
  projected: number,
): SavingsView {
  // What each past month really left over: income less everything spent.
  const pastSaved = history.reduce(
    (total, month) => total + monthSaving(month),
    0,
  );

  return {
    opening,
    pastSaved,
    pastSavedLabel: signedTaka(pastSaved),
    // Deliberately the same three parts the balance is built from, so the
    // headline here and the one in the header can never disagree.
    total: opening + pastSaved + thisMonth,
    thisMonth,
    projected,
    sentence:
      projected >= 0
        ? `প্রতি মাসে যা বেঁচে যায় সেটা এর সাথে যোগ হয়। এই মাসে এখনকার খরচের গতি ধরলে মাস শেষে ${formatTaka(projected)} থাকবে।`
        : `প্রতি মাসে যা বেঁচে যায় সেটা এর সাথে যোগ হয়। তবে এখনকার খরচের গতি ধরলে এই মাসে জমার বদলে ${formatTaka(-projected)} কমে যাবে।`,
    months: buildSavingsResults(history),
  };
}
