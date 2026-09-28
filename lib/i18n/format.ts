import type { Locale } from "./config";

const banglaDigits = "০১২৩৪৫৬৭৮৯";

const monthNames: Record<Locale, string[]> = {
  bn: [
    "জানুয়ারি",
    "ফেব্রুয়ারি",
    "মার্চ",
    "এপ্রিল",
    "মে",
    "জুন",
    "জুলাই",
    "আগস্ট",
    "সেপ্টেম্বর",
    "অক্টোবর",
    "নভেম্বর",
    "ডিসেম্বর",
  ],
  en: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
};

export function toLatinDigits(value: string) {
  return value.replace(/[০-৯]/g, (digit) =>
    String(banglaDigits.indexOf(digit)),
  );
}

export function createFormat(locale: Locale) {
  const digits = (value: number | string) =>
    locale === "bn"
      ? String(value).replace(/\d/g, (digit) => banglaDigits[Number(digit)])
      : String(value);

  const number = (value: number) =>
    digits(Math.round(value).toLocaleString("en-US"));

  const taka = (value: number) =>
    `${value < 0 ? "-" : ""}৳${number(Math.abs(value))}`;

  const signedTaka = (value: number) =>
    `${value >= 0 ? "+" : "−"}${taka(Math.abs(value))}`;

  const month = (index: number) => monthNames[locale][index] ?? "";

  return { locale, digits, number, taka, signedTaka, month };
}

export type Format = ReturnType<typeof createFormat>;
