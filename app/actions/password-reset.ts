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
import { getLocale, getT } from "@/lib/i18n/server";
import { authSchemas } from "@/lib/validation/auth";
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

  const locale = await getLocale();
  after(async () => {
    try {
      await sendPasswordResetCode({
        to: user.email,
        name: user.name,
        code,
        minutes: resetCodeMinutes,
        locale,
      });
    } catch (error) {
      console.error("Failed to send password reset code", error);
    }
  });
}

async function schemas() {
  const [t, validation] = await Promise.all([
    getT("errors"),
    getT("validation"),
  ]);
  return { t, ...authSchemas(validation) };
}

export async function requestPasswordReset(
  values: ForgotPasswordValues,
): Promise<AuthActionResult> {
  const { t, forgotPassword: schema } = await schemas();
  const parsed = schema.safeParse(values);
  if (!parsed.success) return { error: t("invalidForm") };

  await sendCodeIfAccountExists(parsed.data.email);
  await saveResetRequest(parsed.data.email);
  return {};
}

export async function resendPasswordResetCode(): Promise<AuthActionResult> {
  const t = await getT("errors");
  const request = await readResetRequest();
  if (!request) return { error: t("resetExpired") };
  if (secondsUntilResend(request.sentAt) > 0) {
    return { error: t("resendTooSoon") };
  }

  await sendCodeIfAccountExists(request.email);
  await saveResetRequest(request.email);
  return {};
}

export async function verifyPasswordResetCode(
  values: ResetCodeValues,
): Promise<AuthActionResult> {
  const { t, resetCode: schema } = await schemas();
  const parsed = schema.safeParse(values);
  if (!parsed.success) return { error: t("wrongCode") };

  const request = await readResetRequest();
  if (!request) return { error: t("resetExpired") };

  const user = await db.user.findUnique({
    where: { email: request.email },
    select: { id: true },
  });
  if (!user) return { error: t("wrongCode") };

  const check = await checkResetCode(user.id, parsed.data.code);
  if (check.status === "wrong") return { error: t("wrongCode") };
  if (check.status === "dead") return { error: t("deadCode") };

  await saveResetVerified(user.id, check.otpId);
  await clearResetRequest();
  return {};
}

export async function resetPassword(
  values: SetPasswordValues,
): Promise<AuthActionResult> {
  const { t, setPassword: schema } = await schemas();
  const parsed = schema.safeParse(values);
  if (!parsed.success) return { error: t("invalidForm") };

  const verified = await readResetVerified();
  if (!verified) return { error: t("resetExpired") };

  const replaced = await replacePassword(
    verified.userId,
    verified.otpId,
    await hashPassword(parsed.data.password),
  );
  if (!replaced) return { error: t("resetExpired") };

  await clearResetVerified();
  await createSession(verified.userId);
  return {};
}
