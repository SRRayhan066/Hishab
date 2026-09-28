"use server";

import { refresh } from "next/cache";
import { ownedAccountIds } from "@/lib/finance/account-store";
import { currentSessionMonth } from "@/lib/finance/month-store";
import { replaceIncomeSection } from "@/lib/finance/section-store";
import { invalidRowError, signedOutError } from "@/lib/finance/messages";
import { planSectionSchema } from "@/lib/validation/finance";
import type { PlanRowValues, SectionSaveResult } from "@/types/finance";

/**
 * Saves the whole "যা আসে" section in one go — adds, edits and removals
 * together — so a screenful of changes costs a single request.
 */
export async function saveIncomeSection(
  rows: PlanRowValues[],
): Promise<SectionSaveResult> {
  const parsed = planSectionSchema.safeParse(rows);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? invalidRowError };
  }

  const session = await currentSessionMonth();
  if (!session) return { error: signedOutError };

  const result = await replaceIncomeSection(
    session.userId,
    session.monthId,
    await ownedAccountIds(session.userId),
    parsed.data,
  );
  if (result.error) return result;

  refresh();
  return { rows: result.rows };
}
