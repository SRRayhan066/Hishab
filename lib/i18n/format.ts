import {
  currencySymbols,
  defaultCurrency,
  type Currency,
  type Locale,
} from "./config";

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

const weekdayNames: Record<Locale, string[]> = {
  bn: ["র", "সো", "ম", "বু", "বৃ", "শু", "শ"],
  en: ["S", "M", "T", "W", "T", "F", "S"],
};

export function toLatinDigits(value: string) {
  return value.replace(/[০-৯]/g, (digit) =>
    String(banglaDigits.indexOf(digit)),
  );
}

export function createFormat(
  locale: Locale,
  currency: Currency = defaultCurrency,
) {
  const symbol = currencySymbols[currency];

  const digits = (value: number | string) =>
    locale === "bn"
      ? String(value).replace(/\d/g, (digit) => banglaDigits[Number(digit)])
      : String(value);

  const number = (value: number) =>
    digits(Math.round(value).toLocaleString("en-US"));

  const taka = (value: number) =>
    `${value < 0 ? "-" : ""}${symbol}${number(Math.abs(value))}`;

  const signedTaka = (value: number) =>
    `${value > 0 ? "+" : value < 0 ? "−" : ""}${taka(Math.abs(value))}`;

  const month = (index: number) => monthNames[locale][index] ?? "";

  const monthShort = (index: number) => {
    const name = month(index);
    return locale === "en" ? name.slice(0, 3) : name;
  };

  return {
    locale,
    currency,
    symbol: symbol.trim(),
    digits,
    number,
    taka,
    signedTaka,
    month,
    monthShort,
    weekdays: weekdayNames[locale],
  };
}

export type Format = ReturnType<typeof createFormat>;
