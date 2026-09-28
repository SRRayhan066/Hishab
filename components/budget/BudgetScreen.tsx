"use client";

import { useEffect, useMemo } from "react";
import { saveCategorySection } from "@/app/actions/budget";
import { saveIncomeSection } from "@/app/actions/income";
import { incomeChanges, overdrawnAccount } from "@/lib/finance/accounts";
import { formatTaka } from "@/lib/finance/format";
import { buildBudgetPlan } from "@/lib/finance/budget";
import { balanceBelowZeroError } from "@/lib/finance/messages";
import type { MonthData } from "@/lib/finance/types";
import { BudgetSection, type RowNote } from "./BudgetSection";
import { PlanSummary } from "./PlanSummary";
import {
  blankRow,
  fieldsTotal,
  spentByCategory,
  toCategoryFields,
  toIncomeFields,
  type PlanRowField,
} from "./plan-form";
import { usePlanSection } from "./usePlanSection";

type BudgetScreenProps = {
  initialData: MonthData;
  monthName: string;
  daysInMonth: number;
};

export function BudgetScreen({
  initialData,
  monthName,
  daysInMonth,
}: BudgetScreenProps) {
  const defaultAccountId = initialData.accounts[0]?.id;
  const checkIncome = (rows: PlanRowField[]) => {
    const after = rows.map((row) => ({
      accountId: row.accountId || defaultAccountId || "",
      amount: Math.round(Number(row.amount)) || 0,
    }));
    const account = overdrawnAccount(
      initialData.accounts,
      incomeChanges(initialData.income, after),
    );
    return account && balanceBelowZeroError(account.name);
  };
  const income = usePlanSection(
    toIncomeFields(initialData.income),
    saveIncomeSection,
    () => blankRow(defaultAccountId),
    checkIncome,
  );
  const categories = usePlanSection(
    toCategoryFields(initialData.categories),
    saveCategorySection,
    () => blankRow(),
  );

  const incomeTotal = fieldsTotal(income.rows);
  const plannedTotal = fieldsTotal(categories.rows);

  const plan = useMemo(
    () => buildBudgetPlan(incomeTotal, plannedTotal, daysInMonth),
    [incomeTotal, plannedTotal, daysInMonth],
  );

  const unsaved = income.dirty || categories.dirty;

  // Auto-save is gone, so the browser has to be the one to speak up.
  useEffect(() => {
    if (!unsaved) return;

    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [unsaved]);

  const spent = useMemo(
    () => spentByCategory(initialData.categories),
    [initialData.categories],
  );

  const categoryNotes: Record<string, RowNote> = useMemo(() => {
    const rows = categories.rows ?? [];

    return Object.fromEntries(
      rows
        .filter((row) => row?.id)
        .map((row) => {
          const id = row.id as string;
          const alreadySpent = spent[id] ?? 0;
          const budget = Number(row.amount) || 0;

          if (alreadySpent > budget) {
            return [
              id,
              {
                note: `এ মাসে এরই মধ্যে ${formatTaka(alreadySpent)} খরচ হয়ে গেছে, বাজেটের চেয়ে ${formatTaka(alreadySpent - budget)} বেশি।`,
                noteTone: "warn",
              } satisfies RowNote,
            ];
          }

          return [
            id,
            {
              note:
                alreadySpent > 0
                  ? `এই মাসে এ পর্যন্ত ${formatTaka(alreadySpent)} খরচ হয়েছে।`
                  : undefined,
              noteTone: "muted",
            } satisfies RowNote,
          ];
        }),
    );
  }, [categories.rows, spent]);

  return (
    <div className="flex flex-col gap-4">
      <PlanSummary plan={plan} monthName={monthName} />

      <BudgetSection
        section={income}
        title="যা আসে"
        hint={
          initialData.accounts.length > 1
            ? "বেতন, টিউশন, ভাড়া — যেখান থেকেই আসুক, আর কোন অ্যাকাউন্টে জমা হয় সেটাও বেছে দাও। পরের মাসেও এগুলো আপনা-আপনি বসে যাবে।"
            : "বেতন, টিউশন, ভাড়া — যেখান থেকেই আসুক। পরের মাসেও এগুলো আপনা-আপনি বসে যাবে, আবার লিখতে হবে না।"
        }
        notes={{}}
        namePlaceholder="আয়ের নাম"
        emptyLabel="এখনো কোনো আয় যোগ করোনি।"
        addLabel="আয়ের খাত যোগ করো"
        totalLabel="মোট আয়"
        total={incomeTotal}
        accounts={
          initialData.accounts.length > 1 ? initialData.accounts : undefined
        }
        accent
      />

      <BudgetSection
        section={categories}
        title="মাসের খরচের পরিকল্পনা"
        hint="বাসা ভাড়া, বাজার, যাওয়া-আসা — সব খাত এখানে। এটা শুধু পরিকল্পনা; খরচ লিখলে তবেই টাকা কাটবে।"
        notes={categoryNotes}
        namePlaceholder="খাতের নাম"
        emptyLabel="এখনো কোনো খরচের খাত যোগ করোনি।"
        addLabel="খরচের খাত যোগ করো"
        totalLabel="মোট বাজেট"
        total={plannedTotal}
      />
    </div>
  );
}
