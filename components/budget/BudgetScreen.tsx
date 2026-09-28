"use client";

import { useEffect, useMemo } from "react";
import { saveCategorySection } from "@/app/actions/budget";
import { saveIncomeSection } from "@/app/actions/income";
import { incomeChanges, overdrawnAccount } from "@/lib/finance/accounts";
import { useFormat, useT } from "@/lib/i18n/client";
import { buildBudgetPlan } from "@/lib/finance/budget";
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
  const t = useT("budget");
  const errorsT = useT("errors");
  const format = useFormat();
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
    return account && errorsT("balanceBelowZero", { name: account.name });
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
                note: t("overSpent", {
                  spent: format.taka(alreadySpent),
                  over: format.taka(alreadySpent - budget),
                }),
                noteTone: "warn",
              } satisfies RowNote,
            ];
          }

          return [
            id,
            {
              note:
                alreadySpent > 0
                  ? t("spentSoFar", { amount: format.taka(alreadySpent) })
                  : undefined,
              noteTone: "muted",
            } satisfies RowNote,
          ];
        }),
    );
  }, [categories.rows, spent, t, format]);

  return (
    <div className="flex flex-col gap-4">
      <PlanSummary plan={plan} monthName={monthName} />

      <BudgetSection
        section={income}
        title={t("incomeTitle")}
        hint={
          initialData.accounts.length > 1
            ? t("incomeHintAccounts")
            : t("incomeHint")
        }
        notes={{}}
        namePlaceholder={t("incomeName")}
        emptyLabel={t("incomeEmpty")}
        addLabel={t("incomeAdd")}
        totalLabel={t("incomeTotal")}
        total={incomeTotal}
        accounts={
          initialData.accounts.length > 1 ? initialData.accounts : undefined
        }
        accent
        tour="budgetIncome"
      />

      <BudgetSection
        section={categories}
        title={t("planTitle")}
        hint={t("planHint")}
        notes={categoryNotes}
        namePlaceholder={t("planName")}
        emptyLabel={t("planEmpty")}
        addLabel={t("planAdd")}
        totalLabel={t("planTotal")}
        total={plannedTotal}
        tour="budgetPlan"
      />
    </div>
  );
}
