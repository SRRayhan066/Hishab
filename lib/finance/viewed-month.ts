import "server-only";
import { cookies } from "next/headers";
import { minutesFromNow, secureCookieOptions } from "@/lib/auth/cookies";
import { parsePeriodKey, periodKey, type Period } from "./period";

const viewedMonthCookie = "viewed-month";
const viewedMonthMinutes = 60;

export async function getViewedPeriod(): Promise<Period | null> {
  const cookieStore = await cookies();
  return parsePeriodKey(cookieStore.get(viewedMonthCookie)?.value);
}

export async function setViewedPeriod(period: Period | null) {
  const cookieStore = await cookies();

  if (!period) {
    cookieStore.delete(viewedMonthCookie);
    return;
  }

  cookieStore.set(
    viewedMonthCookie,
    periodKey(period),
    secureCookieOptions(minutesFromNow(viewedMonthMinutes)),
  );
}
