"use client";

import { Card } from "@/components/ui/Card";
import { buildBudgetPlan } from "@/lib/finance/budget";
import type { MonthData } from "@/lib/finance/types";
import { useFormat, useT } from "@/lib/i18n/client";
import { BudgetSummary } from "./BudgetSummary";
import { HistoryLink } from "./HistoryLink";
import { spentByCategory } from "./plan-form";

type PastBudgetProps = {
  data: MonthData;
  daysInMonth: number;
};

type PastRow = { id: string; name: string; amount: number; note?: string };

const total = (rows: PastRow[]) =>
  rows.reduce((sum, row) => sum + row.amount, 0);

export function PastBudget({ data, daysInMonth }: PastBudgetProps) {
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
    <div className="grid grid-cols-[minmax(0,1fr)] gap-4">
      <BudgetSummary
        plan={buildBudgetPlan(total(income), total(planned), daysInMonth)}
      />
      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <PastSection
          title={t("planTitle")}
          emptyLabel={t("planEmpty")}
          rows={planned}
        />
        <div className="grid min-w-0 gap-4">
          <PastSection
            title={t("incomeTitle")}
            emptyLabel={t("incomeEmpty")}
            rows={income}
            accent
          />
          <HistoryLink />
        </div>
      </div>
    </div>
  );
}

type PastSectionProps = {
  title: string;
  emptyLabel: string;
  rows: PastRow[];
  accent?: boolean;
};

function PastSection({ title, emptyLabel, rows, accent = false }: PastSectionProps) {
  const format = useFormat();

  return (
    <Card className="grid grid-cols-[minmax(0,1fr)] p-5 md:p-6">
      <div className="mb-2 flex items-baseline justify-between gap-2.5">
        <h2 className="font-display text-[19px] font-bold">{title}</h2>
        <span
          className={`font-display text-[17px] font-bold ${accent ? "text-primary-dark" : ""}`}
        >
          {format.taka(total(rows))}
        </span>
      </div>

      {rows.length === 0 ? (
        <p className="text-ink-soft border-t border-[#f4f0e7] pt-3 text-[15px]">
          {emptyLabel}
        </p>
      ) : (
        <ul>
          {rows.map((row) => (
            <li
              key={row.id}
              className="flex items-center gap-3 border-t border-[#f4f0e7] py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-semibold">{row.name}</p>
                {row.note && (
                  <p className="text-ink-soft text-[13px]">{row.note}</p>
                )}
              </div>
              <span className="font-display text-[16px] font-bold">
                {format.taka(row.amount)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
