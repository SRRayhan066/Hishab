import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/auth/session";
import { getFormat, getT } from "@/lib/i18n/server";
import { loadMonthSnapshot } from "./month-store";
import { monthEndReference, zonedReferenceDate, type Period } from "./period";
import { buildMonthSummary } from "./summary";
import type { MonthData, MonthSummary } from "./types";
import { getViewedPeriod } from "./viewed-month";

export type MonthView = {
  monthId: string;
  period: Period;
  /** Every month the user has a record of, newest first. */
  months: Period[];
  data: MonthData;
  summary: MonthSummary;
  monthLabel: string;
  daysLabel: string;
  /** The wallet figure shown in every screen's header. */
  savingsLabel: string;
};

/**
 * Every app screen starts here: it resolves the signed-in user, makes sure
 * this month exists (carrying last month's plan forward on the first visit),
 * and returns both the raw rows and the numbers built from them, for the month
 * the user picked — the current one unless they chose otherwise.
 *
 * `cache` scopes the result to one request, so the layout's header and the
 * page below it — which both need these numbers — share a single read of the
 * database instead of each paying for their own.
 */
export const getMonthView = cache(async function getMonthView(): Promise<MonthView> {
  const userId = await getSessionUserId();
  // `proxy.ts` already redirects signed-out visitors, but a page must never
  // rely on that alone before reading somebody's money.
  if (!userId) redirect("/login");

  const viewed = await getViewedPeriod();
  const [{ monthId, period, isPast, months, data }, t, header, format] = await Promise.all([
    loadMonthSnapshot(userId, viewed),
    getT("summary"),
    getT("header"),
    getFormat(),
  ]);
  const summary = buildMonthSummary(
    data,
    isPast ? monthEndReference(period) : zonedReferenceDate(),
    { t, format },
    isPast,
  );
  const daysLabel = isPast
    ? ""
    : header(summary.daysLeft === 1 ? "daysLeftOne" : "daysLeft", {
        days: format.number(summary.daysLeft),
      });

  return {
    monthId,
    period,
    months,
    data,
    summary,
    monthLabel: [`${summary.monthName} ${format.digits(summary.year)}`, daysLabel]
      .filter(Boolean)
      .join(" · "),
    daysLabel,
    savingsLabel: format.taka(summary.balance),
  };
});
