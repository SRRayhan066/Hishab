"use server";

import { refresh } from "next/cache";
import { db } from "@/lib/db";
import {
  currentMonthForSession,
  nextSortOrder,
} from "@/lib/finance/month-store";
import {
  replaceCategorySection,
  replaceFixedSection,
} from "@/lib/finance/section-store";
import { invalidRowError, signedOutError } from "@/lib/finance/messages";
import {
  newCategorySchema,
  planSectionSchema,
} from "@/lib/validation/finance";
import type {
  NewCategoryValues,
  NewRowResult,
  PlanRowValues,
  SectionSaveResult,
} from "@/types/finance";

/** Saves the whole "যা প্রতি মাসেই যায়" section in one request. */
export async function saveFixedSection(
  rows: PlanRowValues[],
): Promise<SectionSaveResult> {
  const parsed = planSectionSchema.safeParse(rows);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? invalidRowError };
  }

  const monthId = await currentMonthForSession();
  if (!monthId) return { error: signedOutError };

  const result = await replaceFixedSection(monthId, parsed.data);
  if (result.error) return result;

  refresh();
  return { rows: result.rows };
}

/** Saves the whole "হাতখরচের ভাগ" section in one request. */
export async function saveCategorySection(
  rows: PlanRowValues[],
): Promise<SectionSaveResult> {
  const parsed = planSectionSchema.safeParse(rows);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? invalidRowError };
  }

  const monthId = await currentMonthForSession();
  if (!monthId) return { error: signedOutError };

  const result = await replaceCategorySection(monthId, parsed.data);
  if (result.error) return result;

  refresh();
  return { rows: result.rows };
}

/**
 * Creates a single category straight away. Used by the "নতুন খাত" box on the
 * add-expense screen, which needs a real id to attach the expense to.
 */
export async function addCategoryRow(
  values: NewCategoryValues,
): Promise<NewRowResult> {
  const parsed = newCategorySchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? invalidRowError };
  }

  const monthId = await currentMonthForSession();
  if (!monthId) return { error: signedOutError };

  const row = await db.spendCategory.create({
    data: {
      monthId,
      name: parsed.data.name,
      budget: parsed.data.budget,
      sortOrder: await nextSortOrder("category", monthId),
    },
    select: { id: true },
  });

  refresh();
  return { id: row.id };
}
