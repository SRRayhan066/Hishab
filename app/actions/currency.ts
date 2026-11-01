"use server";

import { refresh } from "next/cache";
import { db } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth/session";
import { isCurrency, type Currency } from "@/lib/i18n/config";
import { setCurrencyCookie } from "@/lib/i18n/server";

export async function changeCurrency(currency: Currency) {
  if (!isCurrency(currency)) return;

  await setCurrencyCookie(currency);

  const userId = await getSessionUserId();
  if (userId) {
    await db.user.updateMany({ where: { id: userId }, data: { currency } });
  }

  refresh();
}
