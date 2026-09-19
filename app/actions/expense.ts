"use server";

import { refresh } from "next/cache";
import { db } from "@/lib/db";
import { currentMonthForSession } from "@/lib/finance/month-store";
import { daysInPeriod, zonedToday } from "@/lib/finance/period";
import {
  categoryMissingError,
  expenseDayError,
  invalidRowError,
  rowMissingError,
  signedOutError,
} from "@/lib/finance/messages";
import { expenseSchema, rowIdSchema } from "@/lib/validation/finance";
import type { ExpenseValues, FinanceActionResult } from "@/types/finance";

export async function addExpense(
  values: ExpenseValues,
): Promise<FinanceActionResult> {
  const parsed = expenseSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? invalidRowError };
  }

  const monthId = await currentMonthForSession();
  if (!monthId) return { error: signedOutError };

  const { categoryId, day, amount } = parsed.data;

  // 31 passes the schema, but February has no 31st — and spending can't be
  // recorded for a day that hasn't happened yet in Dhaka.
  const today = zonedToday();
  const lastAllowedDay = Math.min(daysInPeriod(today), today.day);
  if (day > lastAllowedDay) return { error: expenseDayError };

  const category = await db.spendCategory.findFirst({
    where: { id: categoryId, monthId },
    select: { id: true },
  });
  if (!category) return { error: categoryMissingError };

  await db.expense.create({
    data: { categoryId: category.id, day, amount },
  });

  refresh();
  return {};
}

export async function removeExpense(
  id: string,
): Promise<FinanceActionResult> {
  const parsed = rowIdSchema.safeParse(id);
  if (!parsed.success) return { error: rowMissingError };

  const monthId = await currentMonthForSession();
  if (!monthId) return { error: signedOutError };

  const expense = await db.expense.findFirst({
    where: { id: parsed.data, category: { monthId } },
    select: { id: true },
  });
  if (!expense) return { error: rowMissingError };

  await db.expense.delete({ where: { id: expense.id } });

  refresh();
  return {};
}
