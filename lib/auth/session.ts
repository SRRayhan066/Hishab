import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { daysFromNow, secureCookieOptions } from "./cookies";
import {
  sessionAudience,
  sessionCookie,
  signToken,
  verifyToken,
} from "./token";

const rememberedSessionDays = 30;
const browserSessionDays = 1;

export async function createSession(userId: string, remember = true) {
  const expiresAt = daysFromNow(
    remember ? rememberedSessionDays : browserSessionDays,
  );
  const token = await signToken({ sub: userId }, sessionAudience, expiresAt);
  const cookieStore = await cookies();
  cookieStore.set(
    sessionCookie,
    token,
    secureCookieOptions(remember ? expiresAt : undefined),
  );
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(sessionCookie);
}

export const getSessionUserId = cache(async () => {
  const cookieStore = await cookies();
  const payload = await verifyToken(
    cookieStore.get(sessionCookie)?.value,
    sessionAudience,
  );
  return payload?.sub ?? null;
});

export const getCurrentUser = cache(async () => {
  const userId = await getSessionUserId();
  if (!userId) return null;

  return db.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, image: true },
  });
});
