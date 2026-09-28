"use server";

import { refresh } from "next/cache";
import { ownedAccountIds } from "@/lib/finance/account-store";
import { currentSessionMonth } from "@/lib/finance/month-store";
import { replaceIncomeSection } from "@/lib/finance/section-store";
import { getT } from "@/lib/i18n/server";
import { financeSchemas } from "@/lib/validation/finance";
import type { PlanRowValues, SectionSaveResult } from "@/types/finance";

/**
 * Saves the whole "যা আসে" section in one go — adds, edits and removals
 * together — so a screenful of changes costs a single request.
 */
export async function saveIncomeSection(
  rows: PlanRowValues[],
): Promise<SectionSaveResult> {
  const t = await getT("errors");
  const parsed = financeSchemas(t).planSection.safeParse(rows);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? t("invalidRow") };
  }

  const session = await currentSessionMonth();
  if (!session) return { error: t("signedOut") };

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
