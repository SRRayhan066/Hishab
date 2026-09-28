import { formatTaka } from "./format";
import { buildSavingsResults, monthSaving, signedTaka, type MonthResult } from "./history";
import type { MoneyAccount, PastMonth } from "./types";

export const defaultMoneyAccount = { name: "ক্যাশ" };

export type SavingsView = {
  opening: number;
  pastSaved: number;
  pastSavedLabel: string;
  total: number;
  thisMonth: number;
  projected: number;
  sentence: string;
  months: MonthResult[];
};

export function buildSavingsView(
  opening: number,
  total: number,
  history: PastMonth[],
  thisMonth: number,
  projected: number,
): SavingsView {
  const pastSaved = history.reduce(
    (sum, month) => sum + monthSaving(month),
    0,
  );

  return {
    opening,
    pastSaved,
    pastSavedLabel: signedTaka(pastSaved),
    total,
    thisMonth,
    projected,
    sentence:
      projected >= 0
        ? `প্রতি মাসে যা বেঁচে যায় সেটা এর সাথে যোগ হয়। এই মাসে এখনকার খরচের গতি ধরলে মাস শেষে ${formatTaka(projected)} থাকবে।`
        : `প্রতি মাসে যা বেঁচে যায় সেটা এর সাথে যোগ হয়। তবে এখনকার খরচের গতি ধরলে এই মাসে জমার বদলে ${formatTaka(-projected)} কমে যাবে।`,
    months: buildSavingsResults(history),
  };
}

export function balanceWithOpening(
  account: MoneyAccount | undefined,
  opening: number,
): number {
  if (!account) return opening;
  return account.balance - account.openingBalance + opening;
}

export function accountNames(accounts: MoneyAccount[]): Map<string, string> {
  return new Map(accounts.map((account) => [account.id, account.name]));
}
