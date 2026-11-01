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

export const currencySymbols = {
  BDT: "৳",
  INR: "₹",
  PKR: "Rs ",
  USD: "$",
  EUR: "€",
  GBP: "£",
  AED: "AED ",
  MYR: "RM ",
} as const;

export type Currency = keyof typeof currencySymbols;

export const currencies = Object.keys(currencySymbols) as Currency[];

export const defaultCurrency: Currency = "BDT";

export const currencyCookie = "currency";

export function isCurrency(value: unknown): value is Currency {
  return currencies.includes(value as Currency);
}
