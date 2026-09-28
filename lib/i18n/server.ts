import "server-only";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { daysFromNow, secureCookieOptions } from "@/lib/auth/cookies";
import { defaultLocale, isLocale, localeCookie, type Locale } from "./config";
import { bn, type Dictionary } from "./dictionaries/bn";
import { en } from "./dictionaries/en";
import { createFormat } from "./format";
import { createT, type Messages, type Namespace } from "./translate";

const dictionaries: Record<Locale, Dictionary> = { bn, en };

const localeCookieDays = 365;

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(localeCookie)?.value;
  return isLocale(value) ? value : defaultLocale;
}

export async function getDictionary() {
  return dictionaries[await getLocale()];
}

export function translatorFor<N extends Namespace>(locale: Locale, namespace: N) {
  return createT<N>(dictionaries[locale][namespace]);
}

export async function getT<N extends Namespace>(namespace: N) {
  return translatorFor(await getLocale(), namespace);
}

export async function getFormat() {
  return createFormat(await getLocale());
}

export async function pickMessages(namespaces: Namespace[]): Promise<Messages> {
  const dictionary = await getDictionary();
  return Object.fromEntries(
    namespaces.map((namespace) => [namespace, dictionary[namespace]]),
  );
}

export async function setLocaleCookie(locale: Locale) {
  const cookieStore = await cookies();
  cookieStore.set(
    localeCookie,
    locale,
    secureCookieOptions(daysFromNow(localeCookieDays)),
  );
}

export async function syncLocale(userId: string) {
  const cookieStore = await cookies();
  const chosen = cookieStore.get(localeCookie)?.value;

  if (isLocale(chosen)) {
    await db.user.updateMany({
      where: { id: userId, NOT: { locale: chosen } },
      data: { locale: chosen },
    });
    return;
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { locale: true },
  });
  if (isLocale(user?.locale)) await setLocaleCookie(user.locale);
}
