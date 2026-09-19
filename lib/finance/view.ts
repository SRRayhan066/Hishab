import "server-only";
import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/auth/session";
import { formatTaka } from "./format";
import { loadMonthSnapshot } from "./month-store";
import { zonedReferenceDate } from "./period";
import { buildMonthSummary } from "./summary";
import type { MonthData, MonthSummary } from "./types";

export type MonthView = {
  monthId: string;
  data: MonthData;
  summary: MonthSummary;
  monthLabel: string;
  /** The wallet figure shown in every screen's header. */
  savingsLabel: string;
};

/**
 * Every app screen starts here: it resolves the signed-in user, makes sure
 * this month exists (carrying last month's plan forward on the first visit),
 * and returns both the raw rows and the numbers built from them.
 */
export async function getCurrentMonthView(): Promise<MonthView> {
  const userId = await getSessionUserId();
  // `proxy.ts` already redirects signed-out visitors, but a page must never
  // rely on that alone before reading somebody's money.
  if (!userId) redirect("/login");

  const { monthId, data } = await loadMonthSnapshot(userId);
  const summary = buildMonthSummary(data, zonedReferenceDate());

  return {
    monthId,
    data,
    summary,
    monthLabel: `${summary.monthName} ${summary.year} · ${summary.daysLeft} দিন বাকি`,
    savingsLabel: formatTaka(summary.balance),
  };
}
