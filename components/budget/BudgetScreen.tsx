"use client";

import { useEffect, useMemo } from "react";
import { saveCategorySection } from "@/app/actions/budget";
import { saveIncomeSection } from "@/app/actions/income";
import { DirtyBar } from "@/components/app/DirtyBar";
import { incomeChanges, overdrawnAccount } from "@/lib/finance/accounts";
import { buildBudgetPlan } from "@/lib/finance/budget";
import type { MonthData } from "@/lib/finance/types";
import { useFormat, useT } from "@/lib/i18n/client";
import { BudgetSummary } from "./BudgetSummary";
import { HistoryLink } from "./HistoryLink";
import { PlanRows } from "./PlanRows";
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
  daysInMonth: number;
};

export function BudgetScreen({ initialData, daysInMonth }: BudgetScreenProps) {
  const t = useT("budget");
  const errorsT = useT("errors");
  const format = useFormat();
  const defaultAccountId = initialData.accounts[0]?.id;
  const accountNames = new Map(
    initialData.accounts.map((account) => [account.id, account.name]),
  );
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
  const spent = useMemo(
    () => spentByCategory(initialData.categories),
    [initialData.categories],
  );

  const unsaved = income.dirty || categories.dirty;
  const saving = income.busy || categories.busy;
  const changes = income.changes + categories.changes;

  useEffect(() => {
    if (!unsaved) return;

    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [unsaved]);

  const categoryDetail = (index: number, id: string) => {
    if (!id) return null;

    const used = spent[id] ?? 0;
    const budget = Number(categories.rows?.[index]?.amount) || 0;
    const over = used > budget;
    const percent = budget > 0 ? Math.min(100, (used / budget) * 100) : used > 0 ? 100 : 0;

    return (
      <>
        <div className="h-1.5 rounded-full bg-[#f2eee5]">
          <div
            className="h-full rounded-full"
            style={{
              width: `${percent}%`,
              background: over ? "var(--color-over)" : "var(--color-fixed)",
            }}
          />
        </div>
        <span className={over ? "text-over text-[13px]" : "text-ink-soft text-[13px]"}>
          {used === 0
            ? t("noteNothing")
            : over
              ? t("noteOver", {
                  spent: format.taka(used),
                  over: format.taka(used - budget),
                })
              : t("noteSpent", {
                  spent: format.taka(used),
                  left: format.taka(budget - used),
                })}
        </span>
      </>
    );
  };

  const incomeDetail = (index: number) => {
    const accountId = income.rows?.[index]?.accountId ?? defaultAccountId;
    const name = accountId ? accountNames.get(accountId) : undefined;

    return name ? (
      <span className="text-ink-soft text-[13px]">
        {t("goesInto", { name })}
      </span>
    ) : null;
  };

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-4">
      <BudgetSummary
        plan={plan}
        status={saving ? "saving" : unsaved ? "dirty" : "clean"}
      />

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <PlanRows
          section={categories}
          title={t("planTitle")}
          total={plannedTotal}
          namePlaceholder={t("planName")}
          emptyLabel={t("planEmpty")}
          addLabel={t("addCategory")}
          detail={categoryDetail}
        />

        <div className="grid min-w-0 gap-4">
          <PlanRows
            section={income}
            title={t("incomeTitle")}
            total={incomeTotal}
            accent
            namePlaceholder={t("incomeName")}
            emptyLabel={t("incomeEmpty")}
            addLabel={t("addIncome")}
            accounts={initialData.accounts}
            detail={incomeDetail}
          />
          <HistoryLink />
        </div>
      </div>

      {unsaved && (
        <DirtyBar
          count={Math.max(changes, 1)}
          busy={saving}
          onDiscard={() => {
            income.discard();
            categories.discard();
          }}
          onSave={() => {
            if (income.dirty) income.save();
            if (categories.dirty) categories.save();
          }}
        />
      )}
    </div>
  );
}
