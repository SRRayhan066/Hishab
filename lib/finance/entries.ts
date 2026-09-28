import { accountNames } from "./accounts";
import type { MonthData } from "./types";

export type RecentEntry = {
  id: string;
  categoryId: string;
  categoryName: string;
  accountId: string;
  accountName: string;
  day: number;
  amount: number;
  addedAt: number;
};

/** Every expense of the month, newest day first. */
export function listEntries(data: MonthData): RecentEntry[] {
  const names = accountNames(data.accounts);
  const rows: RecentEntry[] = [];

  data.categories.forEach((category) =>
    category.entries.forEach((entry) =>
      rows.push({
        id: entry.id,
        categoryId: category.id,
        categoryName: category.name,
        accountId: entry.accountId,
        accountName: names.get(entry.accountId) ?? "",
        day: entry.day,
        amount: entry.amount,
        addedAt: entry.addedAt ?? 0,
      }),
    ),
  );

  return rows.sort((a, b) => b.day - a.day || b.addedAt - a.addedAt);
}

export function lastUsedAccountId(entries: RecentEntry[]): string | undefined {
  let latest: RecentEntry | undefined;
  for (const entry of entries) {
    if (!latest || entry.addedAt > latest.addedAt) latest = entry;
  }
  return latest?.accountId;
}

export function spentOnDay(data: MonthData, day: number): number {
  return data.categories.reduce(
    (total, category) =>
      total +
      category.entries
        .filter((entry) => entry.day === day)
        .reduce((sum, entry) => sum + entry.amount, 0),
    0,
  );
}
