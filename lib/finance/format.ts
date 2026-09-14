export const BENGALI_MONTHS = [
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
];

export function formatTaka(value: number): string {
  const sign = value < 0 ? "-" : "";
  const amount = Math.round(Math.abs(value)).toLocaleString("en-US");
  return `${sign}৳${amount}`;
}
