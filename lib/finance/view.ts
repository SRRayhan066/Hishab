import { getMockMonthData } from "@/lib/mock/month";
import { formatTaka } from "./format";
import { buildMonthSummary } from "./summary";
import type { MonthSummary } from "./types";

export type MonthView = {
  summary: MonthSummary;
  monthLabel: string;
  savingsLabel: string;
};

export function getCurrentMonthView(): MonthView {
  const now = new Date();
  const summary = buildMonthSummary(getMockMonthData(now), now);

  return {
    summary,
    monthLabel: `${summary.monthName} ${summary.year} · ${summary.daysLeft} দিন বাকি`,
    savingsLabel: formatTaka(summary.totalSavings),
  };
}
