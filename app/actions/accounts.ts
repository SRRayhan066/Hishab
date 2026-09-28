"use server";

import { refresh } from "next/cache";
import { db } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth/session";
import { lockBalances, moneyTransaction } from "@/lib/finance/account-store";
import { overdrawnAccount } from "@/lib/finance/accounts";
import { currentSessionMonth } from "@/lib/finance/month-store";
import { lastRecordableDay } from "@/lib/finance/period";
import { replaceAccountSection } from "@/lib/finance/section-store";
import { getFormat, getT } from "@/lib/i18n/server";
import { financeSchemas, rowIdSchema } from "@/lib/validation/finance";
import type {
  AccountRowValues,
  FinanceActionResult,
  SectionSaveResult,
  TransferValues,
} from "@/types/finance";

export async function saveAccountSection(
  rows: AccountRowValues[],
): Promise<SectionSaveResult> {
  const t = await getT("errors");
  const parsed = financeSchemas(t).accountSection.safeParse(rows);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? t("invalidRow") };
  }

  const userId = await getSessionUserId();
  if (!userId) return { error: t("signedOut") };

  const result = await replaceAccountSection(userId, parsed.data);
  if (result.error) return result;

  refresh();
  return { rows: result.rows };
}

export async function addTransfer(
  values: TransferValues,
): Promise<FinanceActionResult> {
  const [t, format] = await Promise.all([getT("errors"), getFormat()]);
  const parsed = financeSchemas(t).transfer.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? t("invalidRow") };
  }

  const session = await currentSessionMonth();
  if (!session) return { error: t("signedOut") };

  const { fromId, toId, day, amount } = parsed.data;
  if (day > lastRecordableDay()) return { error: t("expenseDay") };

  const result = await moneyTransaction(async (tx) => {
    const accounts = await lockBalances(tx, session.userId, [fromId, toId]);
    if (accounts.length !== 2) return { error: t("accountGone") };

    const source = overdrawnAccount(accounts, new Map([[fromId, -amount]]));
    if (source) {
      return {
        error: t("notEnoughBalance", {
          name: source.name,
          balance: format.taka(source.balance),
        }),
      };
    }

    await tx.transfer.create({
      data: { monthId: session.monthId, fromId, toId, day, amount },
    });
    return {};
  });
  if (result.error) return result;

  refresh();
  return {};
}

export async function removeTransfer(
  id: string,
): Promise<FinanceActionResult> {
  const t = await getT("errors");
  const parsed = rowIdSchema.safeParse(id);
  if (!parsed.success) return { error: t("rowMissing") };

  const session = await currentSessionMonth();
  if (!session) return { error: t("signedOut") };

  const transfer = await db.transfer.findFirst({
    where: { id: parsed.data, monthId: session.monthId },
    select: { id: true, toId: true, amount: true },
  });
  if (!transfer) return { error: t("rowMissing") };

  const overdrawn = await moneyTransaction(async (tx) => {
    const accounts = await lockBalances(tx, session.userId, [transfer.toId]);
    const found = overdrawnAccount(
      accounts,
      new Map([[transfer.toId, -transfer.amount]]),
    );
    if (found) return found;

    await tx.transfer.delete({ where: { id: transfer.id } });
    return undefined;
  });
  if (overdrawn) {
    return { error: t("balanceBelowZero", { name: overdrawn.name }) };
  }

  refresh();
  return {};
}
