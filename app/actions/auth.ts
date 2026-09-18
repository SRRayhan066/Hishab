"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Prisma } from "@/lib/generated/prisma/client";
import { hashPassword } from "@/lib/auth/password";
import { createSession, deleteSession } from "@/lib/auth/session";
import {
  clearPendingGoogleSignUp,
  googleProvider,
  readPendingGoogleSignUp,
} from "@/lib/auth/google";
import {
  emailTakenError,
  googleExpiredError,
  invalidFormError,
} from "@/lib/auth/messages";
import { setPasswordSchema, signUpSchema } from "@/lib/validation/auth";
import type {
  AuthActionResult,
  SetPasswordValues,
  SignUpValues,
} from "@/types/auth";

function isUniqueViolation(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

export async function signUp(values: SignUpValues): Promise<AuthActionResult> {
  const parsed = signUpSchema.safeParse(values);
  if (!parsed.success) return { error: invalidFormError };

  const { name, email, password } = parsed.data;

  const existing = await db.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (existing) return { error: emailTakenError };

  try {
    const user = await db.user.create({
      data: { name, email, passwordHash: await hashPassword(password) },
      select: { id: true },
    });
    await createSession(user.id);
  } catch (error) {
    if (isUniqueViolation(error)) return { error: emailTakenError };
    throw error;
  }

  return {};
}

export async function completeGoogleSignUp(
  values: SetPasswordValues,
): Promise<AuthActionResult> {
  const parsed = setPasswordSchema.safeParse(values);
  if (!parsed.success) return { error: invalidFormError };

  const pending = await readPendingGoogleSignUp();
  if (!pending) return { error: googleExpiredError };

  const existing = await db.user.findUnique({
    where: { email: pending.email },
    select: { id: true },
  });
  if (existing) {
    await clearPendingGoogleSignUp();
    return { error: emailTakenError };
  }

  try {
    const user = await db.user.create({
      data: {
        name: pending.name,
        email: pending.email,
        image: pending.image,
        passwordHash: await hashPassword(parsed.data.password),
        accounts: {
          create: {
            provider: googleProvider,
            providerAccountId: pending.googleId,
          },
        },
      },
      select: { id: true },
    });
    await clearPendingGoogleSignUp();
    await createSession(user.id);
  } catch (error) {
    if (isUniqueViolation(error)) return { error: emailTakenError };
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
