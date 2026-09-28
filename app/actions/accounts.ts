"use server";

import { refresh } from "next/cache";
import { db } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth/session";
import {
  currentMonthForSession,
  currentSessionMonth,
} from "@/lib/finance/month-store";
import { lastRecordableDay } from "@/lib/finance/period";
import { replaceAccountSection } from "@/lib/finance/section-store";
import {
  accountGoneError,
  expenseDayError,
  invalidRowError,
  rowMissingError,
  signedOutError,
} from "@/lib/finance/messages";
import {
  accountSectionSchema,
  rowIdSchema,
  transferSchema,
} from "@/lib/validation/finance";
import type {
  AccountRowValues,
  FinanceActionResult,
  SectionSaveResult,
  TransferValues,
} from "@/types/finance";

export async function saveAccountSection(
  rows: AccountRowValues[],
): Promise<SectionSaveResult> {
  const parsed = accountSectionSchema.safeParse(rows);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? invalidRowError };
  }

  const userId = await getSessionUserId();
  if (!userId) return { error: signedOutError };

  const result = await replaceAccountSection(userId, parsed.data);
  if (result.error) return result;

  refresh();
  return { rows: result.rows };
}

export async function addTransfer(
  values: TransferValues,
): Promise<FinanceActionResult> {
  const parsed = transferSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? invalidRowError };
  }

  const session = await currentSessionMonth();
  if (!session) return { error: signedOutError };

  const { fromId, toId, day, amount } = parsed.data;
  if (day > lastRecordableDay()) return { error: expenseDayError };

  const owned = await db.moneyAccount.count({
    where: { userId: session.userId, id: { in: [fromId, toId] } },
  });
  if (owned !== 2) return { error: accountGoneError };

  await db.transfer.create({
    data: { monthId: session.monthId, fromId, toId, day, amount },
  });

  refresh();
  return {};
}

export async function removeTransfer(
  id: string,
): Promise<FinanceActionResult> {
  const parsed = rowIdSchema.safeParse(id);
  if (!parsed.success) return { error: rowMissingError };

  const monthId = await currentMonthForSession();
  if (!monthId) return { error: signedOutError };

  const transfer = await db.transfer.findFirst({
    where: { id: parsed.data, monthId },
    select: { id: true },
  });
  if (!transfer) return { error: rowMissingError };

  await db.transfer.delete({ where: { id: transfer.id } });

  refresh();
  return {};
}
