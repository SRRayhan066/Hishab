import type { MonthData } from "./types";

export type RecentEntry = {
  id: string;
  categoryId: string;
  categoryName: string;
  day: number;
  amount: number;
};

export function listEntries(data: MonthData): RecentEntry[] {
  const rows: (RecentEntry & { addedAt: number })[] = [];

  data.variable.forEach((category) =>
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

export function addEntry(
  data: MonthData,
  categoryId: string,
  day: number,
  amount: number,
): MonthData {
  const entry = {
    id: `n${Date.now()}`,
    day,
    amount,
    addedAt: Date.now(),
  };

  return {
    ...data,
    variable: data.variable.map((category) =>
      category.id === categoryId
        ? { ...category, entries: [...category.entries, entry] }
        : category,
    ),
  };
}

export function removeEntry(data: MonthData, entryId: string): MonthData {
  return {
    ...data,
    variable: data.variable.map((category) => ({
      ...category,
      entries: category.entries.filter((entry) => entry.id !== entryId),
    })),
  };
}

export function spentOnDay(data: MonthData, day: number): number {
  return data.variable.reduce(
    (total, category) =>
      total +
      category.entries
        .filter((entry) => entry.day === day)
        .reduce((sum, entry) => sum + entry.amount, 0),
    0,
  );
}
