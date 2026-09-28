"use server";

import { refresh } from "next/cache";
import { db } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth/session";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { setLocaleCookie } from "@/lib/i18n/server";

export async function changeLocale(locale: Locale) {
  if (!isLocale(locale)) return;

  await setLocaleCookie(locale);

  const userId = await getSessionUserId();
  if (userId) {
    await db.user.updateMany({ where: { id: userId }, data: { locale } });
  }

  refresh();
}
