export const locales = ["bn", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "bn";

export const localeCookie = "locale";

export const localeNames: Record<Locale, string> = {
  bn: "বাংলা",
  en: "English",
};

export const localeShortNames: Record<Locale, string> = {
  bn: "বাং",
  en: "EN",
};

export function isLocale(value: unknown): value is Locale {
  return locales.includes(value as Locale);
}
