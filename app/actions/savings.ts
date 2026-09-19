"use server";

import { refresh } from "next/cache";
import { db } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth/session";
import { invalidRowError, signedOutError } from "@/lib/finance/messages";
import { openingSavingsSchema } from "@/lib/validation/finance";
import type { FinanceActionResult } from "@/types/finance";

/**
 * What was already put aside before the app was ever opened. It belongs to the
 * user, not to any one month — every month's leftover is added on top of it.
 */
export async function saveOpeningSavings(
  amount: string | number,
): Promise<FinanceActionResult> {
  const parsed = openingSavingsSchema.safeParse({ amount });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? invalidRowError };
  }

  const userId = await getSessionUserId();
  if (!userId) return { error: signedOutError };

  await db.user.update({
    where: { id: userId },
    data: { openingSavings: parsed.data.amount },
  });

  refresh();
  return {};
}
