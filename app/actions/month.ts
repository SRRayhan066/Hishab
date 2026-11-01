"use server";

import { refresh } from "next/cache";
import { getSessionUserId } from "@/lib/auth/session";
import { currentPeriod, parsePeriodKey, samePeriod } from "@/lib/finance/period";
import { setViewedPeriod } from "@/lib/finance/viewed-month";

export async function viewMonth(key: string | null) {
  const userId = await getSessionUserId();
  if (!userId) return;

  const period = parsePeriodKey(key);
  await setViewedPeriod(
    period && !samePeriod(period, currentPeriod()) ? period : null,
  );

  refresh();
}
