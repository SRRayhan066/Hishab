"use server";

import { refresh } from "next/cache";
import { db } from "@/lib/db";
import {
  currentMonthForSession,
  currentSessionMonth,
} from "@/lib/finance/month-store";
import { lastRecordableDay } from "@/lib/finance/period";
import { lockBalances, moneyTransaction } from "@/lib/finance/account-store";
import { overdrawnAccount } from "@/lib/finance/accounts";
import { getFormat, getT } from "@/lib/i18n/server";
import { financeSchemas, rowIdSchema } from "@/lib/validation/finance";
import type { ExpenseValues, FinanceActionResult } from "@/types/finance";

export async function addExpense(
  values: ExpenseValues,
): Promise<FinanceActionResult> {
  const [t, format] = await Promise.all([getT("errors"), getFormat()]);
  const parsed = financeSchemas(t).expense.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? t("invalidRow") };
  }

  const session = await currentSessionMonth();
  if (!session) return { error: t("signedOut") };

  const { categoryId, accountId, day, amount } = parsed.data;

  // 31 passes the schema, but February has no 31st — and spending can't be
  // recorded for a day that hasn't happened yet in Dhaka.
  if (day > lastRecordableDay()) return { error: t("expenseDay") };

  const category = await db.spendCategory.findFirst({
    where: { id: categoryId, monthId: session.monthId },
    select: { id: true },
  });
  if (!category) return { error: t("categoryMissing") };

  const result = await moneyTransaction(async (tx) => {
    const [account] = await lockBalances(tx, session.userId, [accountId]);
    if (!account) return { error: t("accountGone") };

    if (overdrawnAccount([account], new Map([[account.id, -amount]]))) {
      return {
        error: t("notEnoughBalance", {
          name: account.name,
          balance: format.taka(account.balance),
        }),
      };
    }

    await tx.expense.create({
      data: { categoryId: category.id, accountId: account.id, day, amount },
    });
    return {};
  });
  if (result.error) return result;

  refresh();
  return {};
}

export async function removeExpense(
  id: string,
): Promise<FinanceActionResult> {
  const t = await getT("errors");
  const parsed = rowIdSchema.safeParse(id);
  if (!parsed.success) return { error: t("rowMissing") };

  const monthId = await currentMonthForSession();
  if (!monthId) return { error: t("signedOut") };

  const expense = await db.expense.findFirst({
    where: { id: parsed.data, category: { monthId } },
    select: { id: true },
  });
  if (!expense) return { error: t("rowMissing") };

  await db.expense.delete({ where: { id: expense.id } });

  refresh();
  return {};
}
