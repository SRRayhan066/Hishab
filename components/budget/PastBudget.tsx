"use client";

import { Card } from "@/components/ui/Card";
import { buildBudgetPlan } from "@/lib/finance/budget";
import type { MonthData } from "@/lib/finance/types";
import { useFormat, useT } from "@/lib/i18n/client";
import { PlanSummary } from "./PlanSummary";
import { spentByCategory } from "./plan-form";

type PastBudgetProps = {
  data: MonthData;
  monthName: string;
  daysInMonth: number;
};

type PastRow = { id: string; name: string; amount: number; note?: string };

const total = (rows: PastRow[]) =>
  rows.reduce((sum, row) => sum + row.amount, 0);

export function PastBudget({ data, monthName, daysInMonth }: PastBudgetProps) {
  const t = useT("budget");
  const format = useFormat();
  const spent = spentByCategory(data.categories);

  const income: PastRow[] = data.income;
  const planned: PastRow[] = data.categories
    .filter((category) => !category.temporary)
    .map((category) => ({
      id: category.id,
      name: category.name,
      amount: category.budget,
      note: t("pastSpent", { amount: format.taka(spent[category.id] ?? 0) }),
    }));

  return (
    <div className="flex flex-col gap-4">
      <PlanSummary
        plan={buildBudgetPlan(total(income), total(planned), daysInMonth)}
        monthName={monthName}
        past
      />
      <PastSection
        title={t("incomeTitle")}
        emptyLabel={t("incomeEmpty")}
        totalLabel={t("incomeTotal")}
        rows={income}
      />
      <PastSection
        title={t("planTitle")}
        emptyLabel={t("planEmpty")}
        totalLabel={t("planTotal")}
        rows={planned}
      />
    </div>
  );
}

type PastSectionProps = {
  title: string;
  emptyLabel: string;
  totalLabel: string;
  rows: PastRow[];
};

function PastSection({ title, emptyLabel, totalLabel, rows }: PastSectionProps) {
  const format = useFormat();

  return (
    <Card className="flex flex-col px-[22px] pt-[22px] pb-6">
      <h2 className="font-display text-[18px] font-bold">{title}</h2>

      {rows.length === 0 ? (
        <p className="text-ink-faint pt-4 text-[15px]">{emptyLabel}</p>
      ) : (
        <ul className="mt-1">
          {rows.map((row) => (
            <li
              key={row.id}
              className="flex items-center gap-3 border-b-[1.5px] border-[#f4f0e7] py-2.5 last:border-b-0"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[16px] font-semibold">{row.name}</p>
                {row.note && (
                  <p className="text-ink-muted mt-px text-[14px]">{row.note}</p>
                )}
              </div>
              <span className="text-ink-soft text-[16px] font-semibold">
                {format.taka(row.amount)}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 flex items-center justify-between gap-3 border-t-[1.5px] border-[#f0ebe1] pt-3">
        <span className="text-[16px] font-semibold">{totalLabel}</span>
        <span className="font-display text-[18px] font-bold">
          {format.taka(total(rows))}
        </span>
      </div>
    </Card>
  );
}
