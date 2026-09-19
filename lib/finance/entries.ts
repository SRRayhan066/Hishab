import type { MonthData } from "./types";

export type RecentEntry = {
  id: string;
  categoryId: string;
  categoryName: string;
  day: number;
  amount: number;
};

/** Every expense of the month, newest day first. */
export function listEntries(data: MonthData): RecentEntry[] {
  const rows: (RecentEntry & { addedAt: number })[] = [];

  data.categories.forEach((category) =>
    category.entries.forEach((entry) =>
      rows.push({
        id: entry.id,
        categoryId: category.id,
        categoryName: category.name,
        day: entry.day,
        amount: entry.amount,
        addedAt: entry.addedAt ?? 0,
      }),
    ),
  );

  return rows.sort((a, b) => b.day - a.day || b.addedAt - a.addedAt);
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
