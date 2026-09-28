"use server";

import { refresh } from "next/cache";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { getSessionUserId } from "@/lib/auth/session";
import { defaultMoneyAccount } from "@/lib/finance/account-store";
import { getT } from "@/lib/i18n/server";
import { authSchemas } from "@/lib/validation/auth";
import {
  profileSchemas,
  type ClearDataValues,
  type ProfileNameValues,
} from "@/lib/validation/profile";
import type { AuthActionResult, ChangePasswordValues } from "@/types/auth";

async function schemas() {
  const [t, validation, profile] = await Promise.all([
    getT("errors"),
    getT("validation"),
    getT("profile"),
  ]);
  return {
    t,
    ...authSchemas(validation),
    ...profileSchemas(validation, profile("clearPhrase")),
  };
}

export async function updateName(
  values: ProfileNameValues,
): Promise<AuthActionResult> {
  const { t, name: schema } = await schemas();
  const parsed = schema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? t("invalidForm") };
  }

  const userId = await getSessionUserId();
  if (!userId) return { error: t("signedOut") };

  const { count } = await db.user.updateMany({
    where: { id: userId },
    data: { name: parsed.data.name },
  });
  if (count === 0) return { error: t("signedOut") };

  refresh();
  return {};
}

export async function changePassword(
  values: ChangePasswordValues,
): Promise<AuthActionResult> {
  const { t, changePassword: schema } = await schemas();
  const parsed = schema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? t("invalidForm") };
  }

  const userId = await getSessionUserId();
  if (!userId) return { error: t("signedOut") };

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });
  const matches = await verifyPassword(
    parsed.data.currentPassword,
    user?.passwordHash ?? null,
  );
  if (!user) return { error: t("signedOut") };
  if (!matches) return { error: t("wrongCurrentPassword") };

  await db.user.update({
    where: { id: userId },
    data: { passwordHash: await hashPassword(parsed.data.password) },
  });

  return {};
}

export async function clearAllData(
  values: ClearDataValues,
): Promise<AuthActionResult> {
  const { t, clearData: schema } = await schemas();
  const parsed = schema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? t("invalidForm") };
  }

  const userId = await getSessionUserId();
  if (!userId) return { error: t("signedOut") };

  const account = await defaultMoneyAccount();
  await db.$transaction([
    db.budgetMonth.deleteMany({ where: { userId } }),
    db.moneyAccount.deleteMany({ where: { userId } }),
    db.moneyAccount.create({ data: { userId, ...account } }),
  ]);

  refresh();
  return {};
}
