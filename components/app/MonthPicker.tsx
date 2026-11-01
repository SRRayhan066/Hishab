"use client";

import { useOptimistic, useTransition } from "react";
import { viewMonth } from "@/app/actions/month";
import { Select } from "@/components/ui/Select";
import { periodKey, samePeriod, type Period } from "@/lib/finance/period";
import { useFormat, useT } from "@/lib/i18n/client";

type MonthPickerProps = {
  months: Period[];
  selected: Period;
  daysLabel: string;
};

export function MonthPicker({ months, selected, daysLabel }: MonthPickerProps) {
  const t = useT("header");
  const format = useFormat();
  const [shown, setShown] = useOptimistic(selected);
  const [busy, startTransition] = useTransition();
  const newest = months[0];
  const years = [...new Set(months.map((month) => month.year))];

  const pick = (period: Period) => {
    startTransition(async () => {
      setShown(period);
      await viewMonth(periodKey(period));
    });
  };

  const pickYear = (value: string) => {
    const inYear = months.filter((month) => month.year === Number(value));
    pick(inYear.find((month) => month.month === shown.month) ?? inYear[0]);
  };

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
      <div className="flex items-center gap-2">
        <Select
          value={String(shown.month)}
          options={months
            .filter((month) => month.year === shown.year)
            .map((month) => ({
              value: String(month.month),
              label: format.month(month.month - 1),
            }))}
          onChange={(value) => pick({ year: shown.year, month: Number(value) })}
          disabled={busy}
          aria-label={t("pickMonth")}
          className="w-[150px]"
        />
        <Select
          value={String(shown.year)}
          options={years.map((year) => ({
            value: String(year),
            label: format.digits(year),
          }))}
          onChange={pickYear}
          disabled={busy}
          aria-label={t("pickYear")}
          className="w-[104px]"
        />
      </div>

      {daysLabel && (
        <p className="text-ink-muted text-[14px] font-medium">{daysLabel}</p>
      )}

      {!samePeriod(shown, newest) && (
        <button
          type="button"
          onClick={() => pick(newest)}
          disabled={busy}
          className="text-primary hover:text-primary-dark focus-visible:outline-primary min-h-[44px] cursor-pointer rounded-md text-[14px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-wait"
        >
          {t("backToCurrent")}
        </button>
      )}
    </div>
  );
}
