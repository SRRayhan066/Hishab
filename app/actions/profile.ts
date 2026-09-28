"use server";

import { refresh } from "next/cache";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { getSessionUserId } from "@/lib/auth/session";
import {
  invalidFormError,
  wrongCurrentPasswordError,
} from "@/lib/auth/messages";
import { defaultMoneyAccount } from "@/lib/finance/accounts";
import { signedOutError } from "@/lib/finance/messages";
import { changePasswordSchema } from "@/lib/validation/auth";
import {
  clearDataSchema,
  profileNameSchema,
  type ClearDataValues,
  type ProfileNameValues,
} from "@/lib/validation/profile";
import type { AuthActionResult, ChangePasswordValues } from "@/types/auth";

export async function updateName(
  values: ProfileNameValues,
): Promise<AuthActionResult> {
  const parsed = profileNameSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? invalidFormError };
  }

  const userId = await getSessionUserId();
  if (!userId) return { error: signedOutError };

  const { count } = await db.user.updateMany({
    where: { id: userId },
    data: { name: parsed.data.name },
  });
  if (count === 0) return { error: signedOutError };

  refresh();
  return {};
}

export async function changePassword(
  values: ChangePasswordValues,
): Promise<AuthActionResult> {
  const parsed = changePasswordSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? invalidFormError };
  }

  const userId = await getSessionUserId();
  if (!userId) return { error: signedOutError };

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });
  const matches = await verifyPassword(
    parsed.data.currentPassword,
    user?.passwordHash ?? null,
  );
  if (!user) return { error: signedOutError };
  if (!matches) return { error: wrongCurrentPasswordError };

  await db.user.update({
    where: { id: userId },
    data: { passwordHash: await hashPassword(parsed.data.password) },
  });

  return {};
}

export async function clearAllData(
  values: ClearDataValues,
): Promise<AuthActionResult> {
  const parsed = clearDataSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? invalidFormError };
  }

  const userId = await getSessionUserId();
  if (!userId) return { error: signedOutError };

  await db.$transaction([
    db.budgetMonth.deleteMany({ where: { userId } }),
    db.moneyAccount.deleteMany({ where: { userId } }),
    db.moneyAccount.create({ data: { userId, ...defaultMoneyAccount } }),
  ]);

  refresh();
  return {};
}
