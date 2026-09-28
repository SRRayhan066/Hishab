"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Prisma } from "@/lib/generated/prisma/client";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, deleteSession } from "@/lib/auth/session";
import {
  clearPendingGoogleSignUp,
  googleProvider,
  readPendingGoogleSignUp,
} from "@/lib/auth/google";
import { defaultMoneyAccount } from "@/lib/finance/account-store";
import { getLocale, getT } from "@/lib/i18n/server";
import { authSchemas } from "@/lib/validation/auth";
import type {
  AuthActionResult,
  SetPasswordValues,
  SignInValues,
  SignUpValues,
} from "@/types/auth";

function isUniqueViolation(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

async function schemas() {
  const [t, validation] = await Promise.all([
    getT("errors"),
    getT("validation"),
  ]);
  return { t, ...authSchemas(validation) };
}

export async function signIn(values: SignInValues): Promise<AuthActionResult> {
  const { t, signIn: schema } = await schemas();
  const parsed = schema.safeParse(values);
  if (!parsed.success) return { error: t("wrongCredentials") };

  const { email, password, remember } = parsed.data;

  const user = await db.user.findUnique({
    where: { email },
    select: { id: true, passwordHash: true },
  });

  const passwordMatches = await verifyPassword(
    password,
    user?.passwordHash ?? null,
  );
  if (!user || !passwordMatches) return { error: t("wrongCredentials") };

  await createSession(user.id, remember);
  return {};
}

export async function signUp(values: SignUpValues): Promise<AuthActionResult> {
  const { t, signUp: schema } = await schemas();
  const parsed = schema.safeParse(values);
  if (!parsed.success) return { error: t("invalidForm") };

  const { name, email, password } = parsed.data;

  const existing = await db.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (existing) return { error: t("emailTaken") };

  try {
    const user = await db.user.create({
      data: {
        name,
        email,
        passwordHash: await hashPassword(password),
        locale: await getLocale(),
        moneyAccounts: { create: await defaultMoneyAccount() },
      },
      select: { id: true },
    });
    await createSession(user.id);
  } catch (error) {
    if (isUniqueViolation(error)) return { error: t("emailTaken") };
    throw error;
  }

  return {};
}

export async function completeGoogleSignUp(
  values: SetPasswordValues,
): Promise<AuthActionResult> {
  const { t, setPassword: schema } = await schemas();
  const parsed = schema.safeParse(values);
  if (!parsed.success) return { error: t("invalidForm") };

  const pending = await readPendingGoogleSignUp();
  if (!pending) return { error: t("googleExpired") };

  const existing = await db.user.findUnique({
    where: { email: pending.email },
    select: { id: true },
  });
  if (existing) {
    await clearPendingGoogleSignUp();
    return { error: t("emailTaken") };
  }

  try {
    const user = await db.user.create({
      data: {
        name: pending.name,
        email: pending.email,
        image: pending.image,
        passwordHash: await hashPassword(parsed.data.password),
        locale: await getLocale(),
        accounts: {
          create: {
            provider: googleProvider,
            providerAccountId: pending.googleId,
          },
        },
        moneyAccounts: { create: await defaultMoneyAccount() },
      },
      select: { id: true },
    });
    await clearPendingGoogleSignUp();
    await createSession(user.id);
  } catch (error) {
    if (isUniqueViolation(error)) return { error: t("emailTaken") };
    throw error;
  }

  return {};
}

export async function cancelGoogleSignUp() {
  await clearPendingGoogleSignUp();
  redirect("/login");
}

export async function signOut() {
  await deleteSession();
  redirect("/login");
}
