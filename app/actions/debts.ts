"use server";

import { refresh } from "next/cache";
import { db } from "@/lib/db";
import { lockBalances, moneyTransaction, type MoneyTx } from "@/lib/finance/account-store";
import { overdrawnAccount } from "@/lib/finance/accounts";
import {
  accountEffect,
  debtNet,
  isMoneyOut,
  repaymentsHold,
} from "@/lib/finance/debts";
import { currentSessionMonth } from "@/lib/finance/month-store";
import { lastRecordableDay } from "@/lib/finance/period";
import { getFormat, getT } from "@/lib/i18n/server";
import { financeSchemas, rowIdSchema } from "@/lib/validation/finance";
import type { DebtValues, FinanceActionResult } from "@/types/finance";

async function lockPerson(tx: MoneyTx, personId: string) {
  await tx.$queryRaw`SELECT "id" FROM "DebtPerson" WHERE "id" = ${personId} FOR UPDATE`;
}

async function findOrCreatePerson(
  tx: MoneyTx,
  userId: string,
  personId: string | undefined,
  personName: string | undefined,
) {
  if (personId) {
    return tx.debtPerson.findFirst({
      where: { id: personId, userId },
      select: { id: true, name: true },
    });
  }

  const name = personName ?? "";
  const existing = await tx.debtPerson.findFirst({
    where: { userId, name: { equals: name, mode: "insensitive" } },
    select: { id: true, name: true },
  });
  if (existing) return existing;

  return tx.debtPerson.create({
    data: { userId, name },
    select: { id: true, name: true },
  });
}

export async function addDebtEntry(
  values: DebtValues,
): Promise<FinanceActionResult & { personId?: string }> {
  const [t, format] = await Promise.all([getT("errors"), getFormat()]);
  const parsed = financeSchemas(t).debt.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? t("invalidRow") };
  }

  const session = await currentSessionMonth();
  if (!session) return { error: t("signedOut") };

  const { kind, personId, personName, accountId, day, amount, note } = parsed.data;
  if (day > lastRecordableDay()) return { error: t("expenseDay") };

  const result = await moneyTransaction(
    async (tx): Promise<FinanceActionResult & { personId?: string }> => {
      const [account] = await lockBalances(tx, session.userId, [accountId]);
      if (!account) return { error: t("accountGone") };

      if (
        isMoneyOut(kind) &&
        overdrawnAccount([account], new Map([[account.id, -amount]]))
      ) {
        return {
          error: t("notEnoughBalance", {
            name: account.name,
            balance: format.taka(account.balance),
          }),
        };
      }

      const person = await findOrCreatePerson(
        tx,
        session.userId,
        personId,
        personName,
      );
      if (!person) return { error: t("debtPersonGone") };
      await lockPerson(tx, person.id);

      const net = debtNet(
        await tx.debtEntry.findMany({
          where: { personId: person.id },
          select: { kind: true, amount: true },
        }),
      );

      if (kind === "gotBack" && amount > Math.max(net, 0)) {
        return {
          error: t("debtGotBackTooMuch", {
            name: person.name,
            amount: format.taka(Math.max(net, 0)),
          }),
        };
      }
      if (kind === "paidBack" && amount > Math.max(-net, 0)) {
        return {
          error: t("debtPaidBackTooMuch", {
            name: person.name,
            amount: format.taka(Math.max(-net, 0)),
          }),
        };
      }

      await tx.debtEntry.create({
        data: {
          personId: person.id,
          monthId: session.monthId,
          accountId: account.id,
          kind,
          day,
          amount,
          note: note || null,
        },
      });
      return { personId: person.id };
    },
  );
  if (result.error) return result;

  refresh();
  return result;
}

export async function removeDebtEntry(
  id: string,
): Promise<FinanceActionResult> {
  const t = await getT("errors");
  const parsed = rowIdSchema.safeParse(id);
  if (!parsed.success) return { error: t("rowMissing") };

  const session = await currentSessionMonth();
  if (!session) return { error: t("signedOut") };

  const entry = await db.debtEntry.findFirst({
    where: {
      id: parsed.data,
      monthId: session.monthId,
      person: { userId: session.userId },
    },
    select: {
      id: true,
      personId: true,
      accountId: true,
      kind: true,
      amount: true,
    },
  });
  if (!entry) return { error: t("rowMissing") };

  const result = await moneyTransaction(async (tx): Promise<FinanceActionResult> => {
    const accounts = await lockBalances(tx, session.userId, [entry.accountId]);
    const overdrawn = overdrawnAccount(
      accounts,
      new Map([[entry.accountId, -accountEffect(entry.kind, entry.amount)]]),
    );
    if (overdrawn) {
      return { error: t("balanceBelowZero", { name: overdrawn.name }) };
    }

    await lockPerson(tx, entry.personId);
    const others = await tx.debtEntry.findMany({
      where: { personId: entry.personId, id: { not: entry.id } },
      select: { kind: true, amount: true, createdAt: true },
    });
    const holds = repaymentsHold(
      others.map(({ createdAt, ...other }) => ({
        ...other,
        addedAt: createdAt.getTime(),
      })),
    );
    if (!holds) return { error: t("debtRepaidFirst") };

    await tx.debtEntry.delete({ where: { id: entry.id } });
    return {};
  });
  if (result.error) return result;

  refresh();
  return {};
}
