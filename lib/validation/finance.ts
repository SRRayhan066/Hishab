import { z } from "zod";
import {
  amountError,
  categoryNameError,
  expenseAmountError,
  expenseDayError,
  nameTooLongError,
} from "@/lib/finance/messages";

// Amounts are stored as whole taka. Everything on screen is already whole
// taka, so anything with a decimal on it is rounded rather than rejected.
const MAX_AMOUNT = 100_000_000;

const money = z
  .union([z.string(), z.number()])
  .transform((value) =>
    typeof value === "string" && value.trim() === "" ? 0 : Math.round(Number(value)),
  )
  .pipe(z.number({ error: amountError }).int(amountError).min(0, amountError).max(MAX_AMOUNT, amountError));

// A row can sit nameless for a moment — the user adds it, then types.
const rowName = z.string().trim().max(60, nameTooLongError);

const rowId = z.string().trim().min(1);

// A row the user just added has no database id yet — the whole section is
// sent at once and the server works out what to create, update and delete.
export const planRowSchema = z.object({
  id: z.string().trim().max(64),
  name: rowName,
  amount: money,
});

export const planSectionSchema = z.array(planRowSchema).max(80);

export const newCategorySchema = z.object({
  name: z.string().trim().min(1, categoryNameError).max(60, nameTooLongError),
  budget: money,
});

export const expenseSchema = z.object({
  categoryId: rowId,
  day: z.coerce
    .number({ error: expenseDayError })
    .int(expenseDayError)
    .min(1, expenseDayError)
    .max(31, expenseDayError),
  amount: money.pipe(z.number().min(1, expenseAmountError)),
});

export const openingSavingsSchema = z.object({ amount: money });

export const rowIdSchema = rowId;

export type PlanRowValues = z.input<typeof planRowSchema>;
export type PlanRow = z.output<typeof planRowSchema>;
export type NewCategoryValues = z.input<typeof newCategorySchema>;
export type ExpenseValues = z.input<typeof expenseSchema>;
