"use client";

import { useOptimistic, useState, useTransition } from "react";
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { viewMonth } from "@/app/actions/month";
import { Sheet, SheetTitle } from "@/components/ui/Sheet";
import { periodKey, samePeriod, type Period } from "@/lib/finance/period";
import { useFormat, useT } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

type MonthPickerProps = {
  months: Period[];
  selected: Period;
  note: string;
};

export function MonthPicker({ months, selected, note }: MonthPickerProps) {
  const t = useT("header");
  const format = useFormat();
  const [shown, setShown] = useOptimistic(selected);
  const [, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const pick = (period: Period) => {
    setOpen(false);
    startTransition(async () => {
      setShown(period);
      await viewMonth(periodKey(period));
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="border-line bg-surface text-ink focus-visible:outline-primary flex h-9 cursor-pointer items-center gap-1.5 rounded-full border pr-2 pl-3 text-[14px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <CalendarDays className="text-ink-soft h-[18px] w-[18px]" />
        {format.month(shown.month - 1)} {format.digits(shown.year)}
        <ChevronDown className="text-ink-soft h-5 w-5" />
      </button>
      <span className="text-ink-soft text-[14px]">{note}</span>

      {open && (
        <Sheet
          label={t("chooseMonth")}
          maxWidth={400}
          onClose={() => setOpen(false)}
        >
          <MonthGrid
            months={months}
            selected={shown}
            onPick={pick}
            onClose={() => setOpen(false)}
          />
        </Sheet>
      )}
    </div>
  );
}

type MonthGridProps = {
  months: Period[];
  selected: Period;
  onPick: (period: Period) => void;
  onClose: () => void;
};

function MonthGrid({ months, selected, onPick, onClose }: MonthGridProps) {
  const t = useT("header");
  const format = useFormat();
  const [year, setYear] = useState(selected.year);
  const years = months.map((month) => month.year);
  const firstYear = Math.min(...years);
  const lastYear = Math.max(...years);
  const newest = months[0];
  const oldest = months[months.length - 1];

  const stepClass = (enabled: boolean) =>
    cn(
      "text-ink focus-visible:outline-primary flex h-11 w-11 items-center justify-center rounded-[10px] focus-visible:outline-2 focus-visible:outline-offset-2",
      enabled ? "bg-surface cursor-pointer" : "opacity-35",
    );

  return (
    <div className="grid gap-[18px]">
      <SheetTitle title={t("chooseMonth")} onClose={onClose} />

      <div className="bg-field-alt rounded-tabs flex items-center justify-between gap-3 p-1">
        <button
          type="button"
          disabled={year <= firstYear}
          aria-label={t("previousYear")}
          onClick={() => setYear(year - 1)}
          className={stepClass(year > firstYear)}
        >
          <ChevronLeft className="h-[22px] w-[22px]" />
        </button>
        <span className="font-display text-[20px] font-bold">
          {format.digits(year)}
        </span>
        <button
          type="button"
          disabled={year >= lastYear}
          aria-label={t("nextYear")}
          onClick={() => setYear(year + 1)}
          className={stepClass(year < lastYear)}
        >
          <ChevronRight className="h-[22px] w-[22px]" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 12 }, (_, index) => {
          const period = { year, month: index + 1 };
          const available = months.some((month) => samePeriod(month, period));
          const on = samePeriod(period, selected);
          const now = samePeriod(period, newest);

          return (
            <button
              key={index}
              type="button"
              disabled={!available}
              aria-pressed={on}
              onClick={() => onPick(period)}
              className={cn(
                "focus-visible:outline-primary flex h-14 flex-col items-center justify-center rounded-[14px] border-[1.5px] text-[15px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2",
                on
                  ? "bg-ink border-ink text-white"
                  : now
                    ? "border-primary bg-surface text-ink"
                    : available
                      ? "border-line bg-surface text-ink"
                      : "text-ink-faint border-transparent",
                available ? "cursor-pointer" : "cursor-default",
              )}
            >
              {format.monthShort(index)}
              {now && (
                <span
                  className={cn(
                    "text-[11px] font-semibold",
                    on ? "text-[#dde9d6]" : "text-primary-dark",
                  )}
                >
                  {t("now")}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <span className="text-ink-soft text-center text-[13px]">
        {t("startedTracking", {
          month: format.month(oldest.month - 1),
          year: format.digits(oldest.year),
        })}
      </span>
    </div>
  );
}
