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

type Balance = Pick<MoneyAccount, "id" | "name" | "balance">;

export function overdrawnAccount<T extends Balance>(
  accounts: T[],
  changes: Map<string, number>,
): T | undefined {
  return accounts.find((account) => {
    const change = changes.get(account.id) ?? 0;
    return change < 0 && account.balance + change < 0;
  });
}

type Deposit = { accountId: string; amount: number };

export function incomeChanges(
  before: Deposit[],
  after: Deposit[],
): Map<string, number> {
  const changes = new Map<string, number>();
  const add = ({ accountId, amount }: Deposit, sign: number) =>
    changes.set(accountId, (changes.get(accountId) ?? 0) + sign * amount);

  before.forEach((row) => add(row, -1));
  after.forEach((row) => add(row, 1));
  return changes;
}

export function openingChanges(
  accounts: Pick<MoneyAccount, "id" | "openingBalance">[],
  rows: { id: string; amount: number }[],
): Map<string, number> {
  const opening = new Map(
    accounts.map((account) => [account.id, account.openingBalance]),
  );
  const changes = new Map<string, number>();

  rows.forEach((row) => {
    const before = opening.get(row.id);
    if (before !== undefined) changes.set(row.id, row.amount - before);
  });
  return changes;
}

export function accountNames(accounts: MoneyAccount[]): Map<string, string> {
  return new Map(accounts.map((account) => [account.id, account.name]));
}
