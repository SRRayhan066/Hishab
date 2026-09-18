"use server";

import { after } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import {
  checkResetCode,
  clearResetRequest,
  clearResetVerified,
  issueResetCode,
  readResetRequest,
  readResetVerified,
  replacePassword,
  resetCodeMinutes,
  saveResetRequest,
  saveResetVerified,
  secondsUntilResend,
} from "@/lib/auth/password-reset";
import { sendPasswordResetCode } from "@/lib/email/mailer";
import {
  deadCodeError,
  invalidFormError,
  resendTooSoonError,
  resetExpiredError,
  wrongCodeError,
} from "@/lib/auth/messages";
import {
  forgotPasswordSchema,
  resetCodeSchema,
  setPasswordSchema,
} from "@/lib/validation/auth";
import type {
  AuthActionResult,
  ForgotPasswordValues,
  ResetCodeValues,
  SetPasswordValues,
} from "@/types/auth";

async function sendCodeIfAccountExists(email: string) {
  const user = await db.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true },
  });
  if (!user) return;

  const code = await issueResetCode(user.id);
  if (!code) return;

  after(async () => {
    try {
      await sendPasswordResetCode({
        to: user.email,
        name: user.name,
        code,
        minutes: resetCodeMinutes,
      });
    } catch (error) {
      console.error("Failed to send password reset code", error);
    }
  });
}

export async function requestPasswordReset(
  values: ForgotPasswordValues,
): Promise<AuthActionResult> {
  const parsed = forgotPasswordSchema.safeParse(values);
  if (!parsed.success) return { error: invalidFormError };

  await sendCodeIfAccountExists(parsed.data.email);
  await saveResetRequest(parsed.data.email);
  return {};
}

export async function resendPasswordResetCode(): Promise<AuthActionResult> {
  const request = await readResetRequest();
  if (!request) return { error: resetExpiredError };
  if (secondsUntilResend(request.sentAt) > 0) {
    return { error: resendTooSoonError };
  }

  await sendCodeIfAccountExists(request.email);
  await saveResetRequest(request.email);
  return {};
}

export async function verifyPasswordResetCode(
  values: ResetCodeValues,
): Promise<AuthActionResult> {
  const parsed = resetCodeSchema.safeParse(values);
  if (!parsed.success) return { error: wrongCodeError };

  const request = await readResetRequest();
  if (!request) return { error: resetExpiredError };

  const user = await db.user.findUnique({
    where: { email: request.email },
    select: { id: true },
  });
  if (!user) return { error: wrongCodeError };

  const check = await checkResetCode(user.id, parsed.data.code);
  if (check.status === "wrong") return { error: wrongCodeError };
  if (check.status === "dead") return { error: deadCodeError };

  await saveResetVerified(user.id, check.otpId);
  await clearResetRequest();
  return {};
}

export async function resetPassword(
  values: SetPasswordValues,
): Promise<AuthActionResult> {
  const parsed = setPasswordSchema.safeParse(values);
  if (!parsed.success) return { error: invalidFormError };

  const verified = await readResetVerified();
  if (!verified) return { error: resetExpiredError };

  const replaced = await replacePassword(
    verified.userId,
    verified.otpId,
    await hashPassword(parsed.data.password),
  );
  if (!replaced) return { error: resetExpiredError };

  await clearResetVerified();
  await createSession(verified.userId);
  return {};
}
