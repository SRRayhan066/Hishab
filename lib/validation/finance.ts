import { z } from "zod";
import { accountColorKeys, accountIcons } from "@/lib/finance/account-style";
import type { Translator } from "@/lib/i18n/translate";

// Amounts are stored as whole taka. Everything on screen is already whole
// taka, so anything with a decimal on it is rounded rather than rejected.
const MAX_AMOUNT = 100_000_000;

const rowId = z.string().trim().min(1);

export const rowIdSchema = rowId;

export function financeSchemas(t: Translator<"errors">) {
  const amountError = t("amount");
  const nameTooLongError = t("nameTooLong");
  const accountMissingError = t("accountMissing");
  const expenseDayError = t("expenseDay");

  const money = z
    .union([z.string(), z.number()])
    .transform((value) =>
      typeof value === "string" && value.trim() === "" ? 0 : Math.round(Number(value)),
    )
    .pipe(z.number({ error: amountError }).int(amountError).min(0, amountError).max(MAX_AMOUNT, amountError));

  // A row can sit nameless for a moment — the user adds it, then types.
  const rowName = z.string().trim().max(60, nameTooLongError);

  const day = z.coerce
    .number({ error: expenseDayError })
    .int(expenseDayError)
    .min(1, expenseDayError)
    .max(31, expenseDayError);

  // A row the user just added has no database id yet — the whole section is
  // sent at once and the server works out what to create, update and delete.
  const planRow = z.object({
    id: z.string().trim().max(64),
    name: rowName,
    amount: money,
    accountId: z.string().trim().max(64).optional(),
  });

  const planSection = z.array(planRow).max(80);

  const accountSection = z
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
          context.addIssue({ code: "custom", message: t("accountName"), path: [index, "name"] });
          return;
        }

        const key = row.name.toLocaleLowerCase();
        if (seen.has(key)) {
          context.addIssue({ code: "custom", message: t("accountNameTaken"), path: [index, "name"] });
        }
        seen.add(key);
      });
    });

  const newCategory = z.object({
    name: z.string().trim().min(1, t("categoryName")).max(60, nameTooLongError),
  });

  const expense = z.object({
    categoryId: rowId,
    accountId: z.string({ error: accountMissingError }).trim().min(1, accountMissingError),
    day,
    amount: money.pipe(z.number().min(1, t("expenseAmount"))),
  });

  const transfer = z
    .object({
      fromId: z.string({ error: accountMissingError }).trim().min(1, accountMissingError),
      toId: z.string({ error: accountMissingError }).trim().min(1, accountMissingError),
      day,
      amount: money.pipe(z.number().min(1, t("transferAmount"))),
    })
    .refine((values) => values.fromId !== values.toId, {
      message: t("transferSameAccount"),
      path: ["toId"],
    });

  return { planRow, planSection, accountSection, newCategory, expense, transfer };
}

type FinanceSchemas = ReturnType<typeof financeSchemas>;

export type PlanRowValues = z.input<FinanceSchemas["planRow"]>;
export type PlanRow = z.output<FinanceSchemas["planRow"]>;
export type AccountRowValues = z.input<FinanceSchemas["accountSection"]>[number];
export type AccountRow = z.output<FinanceSchemas["accountSection"]>[number];
export type NewCategoryValues = z.input<FinanceSchemas["newCategory"]>;
export type ExpenseValues = z.input<FinanceSchemas["expense"]>;
export type TransferValues = z.input<FinanceSchemas["transfer"]>;
