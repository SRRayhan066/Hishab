import { formatTaka } from "./format";
import { buildMonthResults, signedTaka, type MonthResult } from "./history";
import type { PastMonth } from "./types";

export type SavingsView = {
  opening: number;
  pastSaved: number;
  pastSavedLabel: string;
  total: number;
  thisMonth: number;
  sentence: string;
  months: MonthResult[];
};

export function buildSavingsView(
  opening: number,
  history: PastMonth[],
  thisMonthSaving: number,
): SavingsView {
  const pastSaved = history.reduce(
    (total, month) => total + (month.budget - month.spent),
    0,
  );

  return {
    opening,
    pastSaved,
    pastSavedLabel: signedTaka(pastSaved),
    total: opening + pastSaved,
    thisMonth: thisMonthSaving,
    sentence:
      thisMonthSaving >= 0
        ? `প্রতি মাসে যা বেঁচে যায় সেটা এর সাথে যোগ হয়। এই মাসে এখনকার খরচের গতি ধরলে ${formatTaka(thisMonthSaving)} যোগ হবে।`
        : `প্রতি মাসে যা বেঁচে যায় সেটা এর সাথে যোগ হয়। তবে এখনকার খরচের গতি ধরলে এই মাসে জমার বদলে ${formatTaka(-thisMonthSaving)} কমে যাবে।`,
    months: buildMonthResults(history),
  };
}
