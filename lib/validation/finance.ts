import { z } from "zod";
import { accountColorKeys, accountIcons } from "@/lib/finance/account-style";
import {
  accountMissingError,
  accountNameError,
  accountNameTakenError,
  amountError,
  categoryNameError,
  expenseAmountError,
  expenseDayError,
  nameTooLongError,
  transferAmountError,
  transferSameAccountError,
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

const day = z.coerce
  .number({ error: expenseDayError })
  .int(expenseDayError)
  .min(1, expenseDayError)
  .max(31, expenseDayError);

// A row the user just added has no database id yet — the whole section is
// sent at once and the server works out what to create, update and delete.
export const planRowSchema = z.object({
  id: z.string().trim().max(64),
  name: rowName,
  amount: money,
  accountId: z.string().trim().max(64).optional(),
});

export const planSectionSchema = z.array(planRowSchema).max(80);

export const accountSectionSchema = z
  .array(
    z.object({
      id: z.string().trim().max(64),
      name: rowName,
      amount: money,
      color: z.string().pipe(z.enum(accountColorKeys)).optional(),
      icon: z.string().pipe(z.enum(accountIcons)).optional(),
    }),
  )
  .max(30)
  .superRefine((rows, context) => {
    const seen = new Set<string>();

    rows.forEach((row, index) => {
      if (row.name === "" && row.amount === 0) return;

      if (row.name === "") {
        context.addIssue({ code: "custom", message: accountNameError, path: [index, "name"] });
        return;
      }

      const key = row.name.toLocaleLowerCase();
      if (seen.has(key)) {
        context.addIssue({ code: "custom", message: accountNameTakenError, path: [index, "name"] });
      }
      seen.add(key);
    });
  });

export const newCategorySchema = z.object({
  name: z.string().trim().min(1, categoryNameError).max(60, nameTooLongError),
});

export const expenseSchema = z.object({
  categoryId: rowId,
  accountId: z.string({ error: accountMissingError }).trim().min(1, accountMissingError),
  day,
  amount: money.pipe(z.number().min(1, expenseAmountError)),
});

export const transferSchema = z
  .object({
    fromId: z.string({ error: accountMissingError }).trim().min(1, accountMissingError),
    toId: z.string({ error: accountMissingError }).trim().min(1, accountMissingError),
    day,
    amount: money.pipe(z.number().min(1, transferAmountError)),
  })
  .refine((values) => values.fromId !== values.toId, {
    message: transferSameAccountError,
    path: ["toId"],
  });

export const rowIdSchema = rowId;

export type PlanRowValues = z.input<typeof planRowSchema>;
export type PlanRow = z.output<typeof planRowSchema>;
export type AccountRowValues = z.input<typeof accountSectionSchema>[number];
export type AccountRow = z.output<typeof accountSectionSchema>[number];
export type NewCategoryValues = z.input<typeof newCategorySchema>;
export type ExpenseValues = z.input<typeof expenseSchema>;
export type TransferValues = z.input<typeof transferSchema>;
