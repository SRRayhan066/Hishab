"use client";

import { useMemo, useOptimistic, useState, useTransition } from "react";
import { Calendar, X } from "lucide-react";
import { removeExpense } from "@/app/actions/expense";
import { Card } from "@/components/ui/Card";
import { FormError } from "@/components/ui/FormError";
import { dayLabel, shortDay } from "@/lib/finance/day-label";
import { groupByDay, type RecentEntry } from "@/lib/finance/entries";
import { useFormat, useT } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

type SpendingListProps = {
  entries: RecentEntry[];
  monthName: string;
  monthIndex: number;
  today: number | null;
};

const ALL = "all";

export function SpendingList({
  entries,
  monthName,
  monthIndex,
  today,
}: SpendingListProps) {
  const t = useT("spending");
  const format = useFormat();
  const readOnly = today === null;
  const [filter, setFilter] = useState(ALL);
  const [error, setError] = useState("");
  const [, startRemoval] = useTransition();
  const [visible, hide] = useOptimistic(entries, (current, id: string) =>
    current.filter((entry) => entry.id !== id),
  );

  const filters = useMemo(() => {
    const seen = new Map<string, string>();
    entries.forEach((entry) => seen.set(entry.categoryId, entry.categoryName));
    return [...seen];
  }, [entries]);

  const shown =
    filter === ALL
      ? visible
      : visible.filter((entry) => entry.categoryId === filter);
  const total = visible.reduce((sum, entry) => sum + entry.amount, 0);
  const count = { count: format.number(visible.length) };

  const remove = (id: string) => {
    setError("");
    startRemoval(async () => {
      hide(id);
      const result = await removeExpense(id);
      if (result.error) setError(result.error);
    });
  };

  const groupLabel = (day: number) => {
    const name = dayLabel(day, today, {
      today: t("todayLabel"),
      yesterday: t("yesterdayLabel"),
      dayMonth: () => "",
    });
    const date = shortDay(format, day, monthIndex);
    return name ? `${name} · ${date}` : date;
  };

  const chip = (on: boolean) =>
    cn(
      "focus-visible:outline-primary h-10 flex-none cursor-pointer rounded-full border px-3.5 text-[14px] font-semibold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
      on ? "bg-ink border-ink text-white" : "bg-field border-line text-ink",
    );

  return (
    <Card className="grid grid-cols-[minmax(0,1fr)] gap-4 p-5 md:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <span className="font-display text-[30px] font-bold tracking-[-0.01em]">
          {t("total", { amount: format.taka(total) })}
        </span>
        <span className="text-ink-soft text-[14px]">
          {readOnly
            ? t(visible.length === 1 ? "entriesPastOne" : "entriesPast", {
                ...count,
                month: monthName,
              })
            : t(visible.length === 1 ? "entriesOne" : "entries", count)}
        </span>
      </div>

      <FormError message={error} />

      {filters.length > 1 && (
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none] md:-mx-6 md:px-6">
          <button
            type="button"
            aria-pressed={filter === ALL}
            onClick={() => setFilter(ALL)}
            className={chip(filter === ALL)}
          >
            {t("all")}
          </button>
          {filters.map(([id, name]) => (
            <button
              key={id}
              type="button"
              aria-pressed={filter === id}
              onClick={() => setFilter(id)}
              className={chip(filter === id)}
            >
              {name}
            </button>
          ))}
        </div>
      )}

      {shown.length === 0 ? (
        <p className="text-ink-soft text-[15px]">
          {filter !== ALL
            ? t("emptyFilter")
            : readOnly
              ? t("emptyPast", { month: monthName })
              : t("empty")}
        </p>
      ) : (
        groupByDay(shown).map((group) => (
          <section key={group.day} className="grid">
            <div className="bg-field-alt text-ink-soft flex h-[34px] items-center justify-between gap-3 rounded-[10px] px-3">
              <span className="flex items-center gap-2 text-[13px] font-bold tracking-[0.04em] uppercase">
                <Calendar className="h-4 w-4" />
                {groupLabel(group.day)}
              </span>
              <span className="text-[13px] font-semibold">
                {format.taka(group.total)}
              </span>
            </div>
            <ul>
              {group.entries.map((entry) => (
                <SpendingRow
                  key={entry.id}
                  entry={entry}
                  label={t("remove", {
                    category: entry.categoryName,
                    amount: format.taka(entry.amount),
                  })}
                  amount={format.taka(entry.amount)}
                  onRemove={readOnly ? undefined : () => remove(entry.id)}
                />
              ))}
            </ul>
          </section>
        ))
      )}
    </Card>
  );
}

function SpendingRow({
  entry,
  label,
  amount,
  onRemove,
}: {
  entry: RecentEntry;
  label: string;
  amount: string;
  onRemove?: () => void;
}) {
  return (
    <li className="flex items-center justify-between gap-3 border-t border-[#f4f0e7] px-1 py-[11px] first:border-t-0">
      <span className="grid min-w-0">
        <span className="truncate text-[15px] font-semibold">
          {entry.categoryName}
        </span>
        <span className="text-ink-soft text-[13px]">{entry.accountName}</span>
      </span>
      <span className="flex items-center gap-1">
        <span className="font-display text-[16px] font-bold whitespace-nowrap">
          {amount}
        </span>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={label}
            className="text-ink-muted hover:text-danger focus-visible:outline-primary -mr-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-[10px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        )}
      </span>
    </li>
  );
}
