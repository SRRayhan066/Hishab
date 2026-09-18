import "server-only";
import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { z } from "zod";
import { db } from "@/lib/db";
import { minutesFromNow, secureCookieOptions } from "./cookies";
import { signToken, verifyToken } from "./token";

export const resetCodeMinutes = 10;
export const resendCooldownSeconds = 60;
const maxCodeAttempts = 5;

const requestCookie = "hishabi_reset";
const requestAudience = "password-reset";
const requestMinutes = 30;

const verifiedCookie = "hishabi_reset_verified";
const verifiedAudience = "password-reset-verified";
const verifiedMinutes = 10;

const requestSchema = z.object({
  email: z.email(),
  sentAt: z.number(),
});

const verifiedSchema = z.object({
  sub: z.string().min(1),
  otpId: z.string().min(1),
});

export type CodeCheck =
  | { status: "valid"; otpId: string }
  | { status: "wrong" }
  | { status: "dead" };

function hashCode(userId: string, code: string) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set");
  return createHmac("sha256", secret).update(`${userId}:${code}`).digest("hex");
}

function sameHash(a: string, b: string) {
  const left = Buffer.from(a, "hex");
  const right = Buffer.from(b, "hex");
  return left.length === right.length && timingSafeEqual(left, right);
}

export function secondsUntilResend(sentAt: number) {
  const elapsed = Math.floor((Date.now() - sentAt) / 1000);
  return Math.max(0, resendCooldownSeconds - elapsed);
}

export async function issueResetCode(userId: string) {
  const latest = await db.passwordResetOtp.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });
  if (latest && secondsUntilResend(latest.createdAt.getTime()) > 0) {
    return null;
  }

  const code = randomInt(0, 1_000_000).toString().padStart(6, "0");

  await db.$transaction([
    db.passwordResetOtp.deleteMany({ where: { userId } }),
    db.passwordResetOtp.create({
      data: {
        userId,
        codeHash: hashCode(userId, code),
        expiresAt: minutesFromNow(resetCodeMinutes),
      },
    }),
  ]);

  return code;
}

export async function checkResetCode(
  userId: string,
  code: string,
): Promise<CodeCheck> {
  const otp = await db.passwordResetOtp.findFirst({
    where: { userId, usedAt: null },
    orderBy: { createdAt: "desc" },
    select: { id: true, codeHash: true },
  });
  if (!otp) return { status: "dead" };

  const attempt = await db.passwordResetOtp.updateMany({
    where: {
      id: otp.id,
      usedAt: null,
      attempts: { lt: maxCodeAttempts },
      expiresAt: { gt: new Date() },
    },
    data: { attempts: { increment: 1 } },
  });
  if (attempt.count === 0) return { status: "dead" };

  if (!sameHash(otp.codeHash, hashCode(userId, code))) {
    return { status: "wrong" };
  }

  const claimed = await db.passwordResetOtp.updateMany({
    where: { id: otp.id, usedAt: null },
    data: { usedAt: new Date() },
  });
  if (claimed.count === 0) return { status: "dead" };

  return { status: "valid", otpId: otp.id };
}

export async function replacePassword(
  userId: string,
  otpId: string,
  passwordHash: string,
) {
  const claimed = await db.passwordResetOtp.deleteMany({
    where: { id: otpId, userId, usedAt: { not: null } },
  });
  if (claimed.count === 0) return false;

  await db.$transaction([
    db.user.update({ where: { id: userId }, data: { passwordHash } }),
    db.passwordResetOtp.deleteMany({ where: { userId } }),
  ]);

  return true;
}

export async function saveResetRequest(email: string) {
  const expiresAt = minutesFromNow(requestMinutes);
  const token = await signToken(
    { email, sentAt: Date.now() },
    requestAudience,
    expiresAt,
  );
  const cookieStore = await cookies();
  cookieStore.set(requestCookie, token, secureCookieOptions(expiresAt));
}

export async function readResetRequest() {
  const cookieStore = await cookies();
  const payload = await verifyToken(
    cookieStore.get(requestCookie)?.value,
    requestAudience,
  );
  const parsed = requestSchema.safeParse(payload);
  return parsed.success ? parsed.data : null;
}

export async function clearResetRequest() {
  const cookieStore = await cookies();
  cookieStore.delete(requestCookie);
}

export async function saveResetVerified(userId: string, otpId: string) {
  const expiresAt = minutesFromNow(verifiedMinutes);
  const token = await signToken(
    { sub: userId, otpId },
    verifiedAudience,
    expiresAt,
  );
  const cookieStore = await cookies();
  cookieStore.set(verifiedCookie, token, secureCookieOptions(expiresAt));
}

export async function readResetVerified() {
  const cookieStore = await cookies();
  const payload = await verifyToken(
    cookieStore.get(verifiedCookie)?.value,
    verifiedAudience,
  );
  const parsed = verifiedSchema.safeParse(payload);
  return parsed.success
    ? { userId: parsed.data.sub, otpId: parsed.data.otpId }
    : null;
}

export async function clearResetVerified() {
  const cookieStore = await cookies();
  cookieStore.delete(verifiedCookie);
}
