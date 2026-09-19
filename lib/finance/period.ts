import { BENGALI_MONTHS } from "./format";

// The app is written for Bangladesh, so "which month is it" is always answered
// in Dhaka time. A server running on UTC would otherwise still be showing
// September at 1:30 AM on the 1st of October.
export const APP_TIME_ZONE = "Asia/Dhaka";

export type Period = {
  year: number;
  /** 1–12, not the 0-based month index `Date` uses. */
  month: number;
};

const dhakaDate = new Intl.DateTimeFormat("en-CA", {
  timeZone: APP_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function zonedToday(now: Date = new Date()) {
  const [year, month, day] = dhakaDate.format(now).split("-").map(Number);
  return { year, month, day };
}

export function currentPeriod(now?: Date): Period {
  const { year, month } = zonedToday(now);
  return { year, month };
}

// `buildMonthSummary` reads its reference date with getFullYear/getMonth/
// getDate, so handing it a date whose *local* parts are Dhaka's keeps every
// calculation on the Dhaka calendar without touching the maths.
export function zonedReferenceDate(now?: Date): Date {
  const { year, month, day } = zonedToday(now);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

export function daysInPeriod({ year, month }: Period): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function periodLabel({ month }: Period): string {
  return BENGALI_MONTHS[month - 1] ?? "";
}

export function periodKey({ year, month }: Period): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}
