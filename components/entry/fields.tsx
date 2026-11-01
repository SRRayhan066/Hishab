"use client";

import { useId, useState, type ReactNode } from "react";
import { CalendarDays } from "lucide-react";
import { AmountInput } from "@/components/ui/AmountInput";
import { FormError } from "@/components/ui/FormError";
import { daysInPeriod, type Period } from "@/lib/finance/period";
import type { EntryContext } from "@/lib/finance/view";
import { useFormat, useT } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

export type FormProps = {
  context: EntryContext;
  amount: string;
  onAmount: (value: string) => void;
  onDone: () => void;
};

export const amountValue = (amount: string) => Math.round(Number(amount)) || 0;

export const fieldLabel = "text-ink-soft text-[14px] font-semibold";

export const pendingBox =
  "bg-field grid gap-2.5 rounded-[16px] border border-dashed border-[#d8d2c4] p-3.5";

export const pendingInput =
  "bg-surface border-line text-ink placeholder:text-ink-soft focus:border-primary h-[46px] w-full min-w-0 rounded-[12px] border px-3 text-[15px] outline-none";

export const pendingAdd =
  "bg-ink focus-visible:outline-primary h-[42px] cursor-pointer rounded-[12px] px-[18px] text-[15px] font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-45";

export const pendingCancel =
  "text-ink-soft hover:text-ink focus-visible:outline-primary h-[42px] cursor-pointer rounded-[12px] px-3.5 text-[15px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2";

export function chipClass(on: boolean, tone: "ink" | "green" = "green") {
  return cn(
    "focus-visible:outline-primary flex h-11 cursor-pointer items-center rounded-full border px-3.5 text-[14px] font-semibold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
    on
      ? tone === "ink"
        ? "border-ink bg-ink text-white"
        : "border-primary bg-panel text-primary-dark"
      : "border-line bg-field text-ink hover:border-line-strong",
  );
}

export const dashedChip =
  "text-ink-soft hover:border-line-strong hover:text-ink focus-visible:outline-primary flex h-11 cursor-pointer items-center gap-1 rounded-full border border-dashed border-[#d8d2c4] px-3.5 text-[14px] font-semibold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2";

export function AmountField({
  amount,
  onAmount,
  invalid,
}: {
  amount: string;
  onAmount: (value: string) => void;
  invalid: boolean;
}) {
  const t = useT("entry");
  const format = useFormat();
  const id = useId();

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-1.5">
      <label htmlFor={id} className={fieldLabel}>
        {t("amount")}
      </label>
      <div
        className={cn(
          "bg-field rounded-field focus-within:border-primary flex h-[54px] items-center gap-2 border px-3.5",
          invalid ? "border-danger-field" : "border-line",
        )}
      >
        <span className="font-display text-ink-muted text-[20px] font-bold whitespace-nowrap">
          {format.symbol}
        </span>
        <AmountInput
          id={id}
          autoFocus
          maxLength={8}
          placeholder="0"
          value={amount}
          onChange={(event) => onAmount(event.target.value)}
          className="font-display text-ink w-0 min-w-0 flex-1 border-0 bg-transparent p-0 text-[26px] font-bold tracking-[-0.01em] outline-none"
        />
      </div>
    </div>
  );
}

export function ChipGroup({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <fieldset className="grid min-w-0 gap-2">
      <legend className={cn(fieldLabel, "mb-2")}>{label}</legend>
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}

export function AccountChips({
  label,
  accounts,
  selected,
  onSelect,
}: {
  label: string;
  accounts: EntryContext["accounts"];
  selected: string;
  onSelect: (id: string) => void;
}) {
  const format = useFormat();

  return (
    <ChipGroup label={label}>
      {accounts.map((account) => (
        <button
          key={account.id}
          type="button"
          aria-pressed={account.id === selected}
          onClick={() => onSelect(account.id)}
          className={chipClass(account.id === selected)}
        >
          {account.name} · {format.taka(account.balance)}
        </button>
      ))}
    </ChipGroup>
  );
}

export function DayField({
  period,
  today,
  day,
  onChange,
}: {
  period: Period;
  today: number;
  day: number;
  onChange: (day: number) => void;
}) {
  const t = useT("entry");
  const common = useT("common");
  const format = useFormat();
  const [calendar, setCalendar] = useState(false);
  const monthIndex = period.month - 1;
  const quick = day === today || day === today - 1;
  const picking = calendar || !quick;
  const firstWeekday = new Date(period.year, monthIndex, 1).getDay();
  const days = Array.from({ length: daysInPeriod(period) }, (_, index) => index + 1);

  const pickQuick = (next: number) => {
    setCalendar(false);
    onChange(next);
  };

  return (
    <div className="grid min-w-0 gap-2">
      <span className={fieldLabel}>{t("when")}</span>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={!picking && day === today}
          onClick={() => pickQuick(today)}
          className={chipClass(!picking && day === today)}
        >
          {common("today")}
        </button>
        {today > 1 && (
          <button
            type="button"
            aria-pressed={!picking && day === today - 1}
            onClick={() => pickQuick(today - 1)}
            className={chipClass(!picking && day === today - 1)}
          >
            {common("yesterday")}
          </button>
        )}
        <button
          type="button"
          aria-pressed={picking}
          aria-expanded={picking}
          onClick={() => setCalendar(true)}
          className={cn(chipClass(picking), "gap-1.5")}
        >
          <CalendarDays className="h-[17px] w-[17px]" />
          {picking
            ? common("dayMonth", {
                day: format.digits(day),
                month: format.monthShort(monthIndex),
              })
            : t("pickDay")}
        </button>
      </div>

      {picking && (
        <div className="border-line-soft bg-surface grid gap-2.5 rounded-[16px] border p-3.5">
          <div className="flex items-center justify-between">
            <span className="font-display text-[16px] font-bold">
              {format.month(monthIndex)} {format.digits(period.year)}
            </span>
            <span className="text-ink-soft text-[13px]">{t("upToToday")}</span>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {format.weekdays.map((name, index) => (
              <span
                key={`${name}-${index}`}
                className="text-ink-soft py-0.5 text-[12px] font-semibold"
              >
                {name}
              </span>
            ))}
            {Array.from({ length: firstWeekday }, (_, index) => (
              <span key={`blank-${index}`} />
            ))}
            {days.map((value) => {
              const allowed = value <= today;
              const on = value === day;

              return (
                <button
                  key={value}
                  type="button"
                  disabled={!allowed}
                  aria-pressed={on}
                  onClick={() => onChange(value)}
                  className={cn(
                    "focus-visible:outline-primary h-10 min-w-0 rounded-[10px] border-[1.5px] p-0 text-[14px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2",
                    on
                      ? "border-ink bg-ink text-white"
                      : value === today
                        ? "border-primary text-ink"
                        : "border-transparent",
                    allowed
                      ? "cursor-pointer"
                      : "text-ink-faint cursor-default",
                  )}
                >
                  {format.digits(value)}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export type PreviewLine = {
  label: string;
  before: string;
  after: string;
  color?: string;
};

export function Preview({ lines }: { lines: PreviewLine[] }) {
  return (
    <div className="bg-field border-line-soft grid gap-2.5 rounded-[16px] border px-4 py-3.5">
      {lines.map((line) => (
        <div
          key={line.label}
          className="flex flex-wrap items-baseline justify-between gap-3"
        >
          <span className="text-ink-soft text-[14px]">{line.label}</span>
          <span className="font-display flex items-baseline gap-1.5 text-[16px] font-bold">
            <span className="text-ink-muted line-through decoration-1">
              {line.before}
            </span>
            <span className="text-ink-muted font-sans font-medium">→</span>
            <span style={{ color: line.color }}>{line.after}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

export function FormFoot({
  error,
  disabled,
  busy,
  label,
  footnote,
}: {
  error: string;
  disabled: boolean;
  busy: boolean;
  label: string;
  footnote: string;
}) {
  const common = useT("common");

  return (
    <>
      <FormError message={error} />
      <div className="grid gap-2">
        <button
          type="submit"
          disabled={disabled || busy}
          className="bg-ink font-display focus-visible:outline-primary h-[52px] cursor-pointer rounded-[14px] text-[17px] font-bold text-white transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-45"
        >
          {busy ? common("saving") : label}
        </button>
        <span className="text-ink-soft text-center text-[13px] text-pretty">
          {footnote}
        </span>
      </div>
    </>
  );
}
