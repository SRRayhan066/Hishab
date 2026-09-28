import { formatTaka } from "./format";

export const saveFailedError = "সেভ করা গেলো না। আবার চেষ্টা করো।";
export const signedOutError = "আবার সাইন ইন করো।";
export const rowMissingError =
  "সারিটা খুঁজে পাওয়া গেলো না। পাতাটা একবার রিফ্রেশ করো।";
export const amountError = "টাকার অঙ্কটা একবার দেখে নাও।";
export const invalidRowError = "তথ্যগুলো একবার দেখে নাও।";
export const nameTooLongError = "নামটা একটু ছোট করো।";

export const categoryNameError = "খাতের নাম লিখে দাও।";
export const categoryMissingError = "কোন খাতে খরচ হলো বেছে নাও।";
export const categoryHasExpensesError =
  "এই খাতে এই মাসের খরচ লেখা আছে, তাই মুছে ফেলা যাবে না। চাইলে সীমা ০ করে দাও।";

export const expenseAmountError = "কত টাকা খরচ হলো লিখে দাও।";
export const expenseDayError = "তারিখটা একবার দেখে নাও।";

export const accountNameError = "অ্যাকাউন্টের নাম লিখে দাও।";
export const accountNameTakenError =
  "একই নামে দুটো অ্যাকাউন্ট রাখা যাবে না।";
export const accountMissingError = "কোন অ্যাকাউন্ট থেকে, বেছে নাও।";
export const accountGoneError =
  "অ্যাকাউন্টটা খুঁজে পাওয়া গেলো না। পাতাটা একবার রিফ্রেশ করো।";
export const accountInUseError =
  "এই অ্যাকাউন্টে আয়, খরচ বা ট্রান্সফার লেখা আছে, তাই মুছে ফেলা যাবে না। চাইলে নাম বদলে দাও।";
export const lastAccountError = "অন্তত একটা অ্যাকাউন্ট রাখতেই হবে।";
export const notEnoughBalanceError = (name: string, balance: number) =>
  `${name}-এ আছে ${formatTaka(balance)}। এর চেয়ে বেশি খরচ বা ট্রান্সফার করা যাবে না।`;
export const balanceBelowZeroError = (name: string) =>
  `এতে ${name}-এর টাকা শূন্যের নিচে নেমে যাবে। আগে ওই অ্যাকাউন্টের খরচ বা ট্রান্সফার ঠিক করো।`;

export const transferAmountError = "কত টাকা পাঠাবে লিখে দাও।";
export const transferSameAccountError =
  "একই অ্যাকাউন্টে ট্রান্সফার করা যায় না। আলাদা দুটো অ্যাকাউন্ট বেছে নাও।";
