"use client";

import { useEffect, useRef } from "react";
import { Plus, WalletMinimal } from "lucide-react";
import { Controller } from "react-hook-form";
import { Card } from "@/components/ui/Card";
import { Select, type SelectOption } from "@/components/ui/Select";
import { formatTaka } from "@/lib/finance/format";
import { cn } from "@/lib/utils";
import { SaveStatus } from "./SaveStatus";
import type { PlanSection } from "./usePlanSection";

const plainGrid = "grid-cols-[minmax(0,1fr)_112px_46px]";
const accountGrid =
  "grid-cols-[minmax(0,1fr)_112px_46px] sm:grid-cols-[minmax(0,1fr)_minmax(0,184px)_112px_46px]";

export type RowNote = {
  note?: string;
  noteTone?: "muted" | "warn";
};

type BudgetSectionProps = {
  section: PlanSection;
  title: string;
  hint: string;
  notes: Record<string, RowNote>;
  namePlaceholder: string;
  emptyLabel: string;
  addLabel: string;
  totalLabel: string;
  total: number;
  accounts?: { id: string; name: string }[];
  accent?: boolean;
  className?: string;
};

export function BudgetSection({
  section,
  title,
  hint,
  notes,
  namePlaceholder,
  emptyLabel,
  addLabel,
  totalLabel,
  total,
  accounts,
  accent = false,
  className,
}: BudgetSectionProps) {
  const { control, register, fields, focusIndex, dirty, busy, state, error } =
    section;
  const nameRefs = useRef(new Map<number, HTMLInputElement | null>());
  const withAccounts = Boolean(accounts);
  const accountOptions: SelectOption[] = (accounts ?? []).map((account) => ({
    value: account.id,
    label: account.name,
  }));

  useEffect(() => {
    if (focusIndex !== null) nameRefs.current.get(focusIndex)?.focus();
  }, [focusIndex, fields.length]);

  return (
    <Card className={cn("flex flex-col px-[22px] pt-[22px] pb-6", className)}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="font-display text-[18px] font-bold">{title}</h2>
          <p className="text-ink-muted mt-0.5 text-[14px]">{hint}</p>
        </div>
        <SaveStatus state={state} error={error} dirty={dirty} />
      </div>

      {fields.length === 0 ? (
        <p className="text-ink-faint pt-4 text-[15px]">{emptyLabel}</p>
      ) : (
        <ul className="mt-3.5 flex flex-col gap-2.5">
          {withAccounts && (
            <li
              aria-hidden
              className={cn(
                "text-ink-faint -mb-1 hidden gap-2 px-1 text-[13px] font-medium sm:grid",
                accountGrid,
              )}
            >
              <span>নাম</span>
              <span>কোন অ্যাকাউন্টে</span>
              <span className="text-right">মাসে কত</span>
            </li>
          )}
          {fields.map((field, index) => {
            const rowNote = notes[field.id] ?? {};
            const nameField = register(`rows.${index}.name`, {
              onChange: section.edited,
            });

            return (
              <li
                key={field.key}
                className={cn(
                  "flex flex-col gap-1.5",
                  withAccounts &&
                    "border-b-[1.5px] border-[#f4f0e7] pb-3 last:border-b-0 last:pb-0 sm:border-b-0 sm:pb-0",
                )}
              >
                <div
                  className={cn(
                    "grid items-center gap-2",
                    withAccounts ? accountGrid : plainGrid,
                  )}
                >
                  <input
                    {...nameField}
                    ref={(node) => {
                      nameField.ref(node);
                      nameRefs.current.set(index, node);
                    }}
                    placeholder={namePlaceholder}
                    aria-label={`${namePlaceholder} ${index + 1}`}
                    className={cn(
                      "bg-field border-line rounded-field text-ink placeholder:text-ink-faint focus:border-primary focus:bg-surface min-h-[46px] min-w-0 border-[1.5px] px-[14px] text-[15px] outline-none transition-colors",
                      withAccounts && "col-start-1 row-start-1",
                    )}
                  />

                  {accounts && (
                    <Controller
                      control={control}
                      name={`rows.${index}.accountId`}
                      render={({ field: account }) => (
                        <Select
                          value={account.value ?? ""}
                          onChange={(value) => {
                            account.onChange(value);
                            section.edited();
                          }}
                          onBlur={account.onBlur}
                          options={accountOptions}
                          icon={
                            <>
                              <WalletMinimal className="h-4 w-4" />
                              <span className="text-ink-muted text-[14px] font-medium sm:hidden">
                                জমা হবে
                              </span>
                            </>
                          }
                          aria-label={`${namePlaceholder} ${index + 1} — কোন অ্যাকাউন্টে জমা হবে`}
                          className="col-span-2 col-start-1 row-start-2 sm:col-span-1 sm:col-start-2 sm:row-start-1"
                        />
                      )}
                    />
                  )}

                  <div
                    className={cn(
                      "bg-field border-line rounded-field focus-within:border-primary focus-within:bg-surface flex min-h-[46px] items-center gap-1 border-[1.5px] px-[11px] transition-colors",
                      withAccounts &&
                        "col-start-2 row-start-1 sm:col-start-3",
                    )}
                  >
                    <span className="text-ink-faint text-[15px] font-semibold">
                      ৳
                    </span>
                    <input
                      {...register(`rows.${index}.amount`, {
                        onChange: section.edited,
                      })}
                      type="number"
                      inputMode="numeric"
                      min={0}
                      step={1}
                      placeholder="0"
                      aria-label={`${namePlaceholder} ${index + 1} — মাসে কত টাকা`}
                      className={cn(
                        "placeholder:text-ink-faint w-full min-w-0 border-none bg-transparent text-right text-[15px] font-bold outline-none",
                        accent ? "text-primary" : "text-ink",
                      )}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => section.removeRow(index)}
                    disabled={busy}
                    aria-label={`${namePlaceholder} ${index + 1} মুছে ফেলো`}
                    className={cn(
                      "border-line text-ink-faint hover:border-danger-line hover:text-danger focus-visible:outline-primary flex h-[46px] w-[46px] cursor-pointer items-center justify-center rounded-[12px] border-[1.5px] text-[20px] leading-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                      withAccounts && "col-start-3 row-start-1 sm:col-start-4",
                    )}
                  >
                    ×
                  </button>
                </div>

                {rowNote.note && (
                  <p
                    className={cn(
                      "pl-[15px] text-[13px]",
                      rowNote.noteTone === "warn"
                        ? "text-danger font-medium"
                        : "text-ink-faint",
                    )}
                  >
                    {rowNote.note}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <button
        type="button"
        onClick={section.add}
        className="text-ink-soft hover:border-line-strong hover:text-ink focus-visible:outline-primary mt-2.5 flex min-h-[46px] cursor-pointer items-center justify-center gap-1.5 rounded-[12px] border-[1.5px] border-dashed border-[#d8d2c4] px-4 text-[15px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <Plus className="h-4 w-4" />
        {addLabel}
      </button>

      <div className="mt-4 flex items-center justify-between gap-3 border-t-[1.5px] border-[#f0ebe1] pt-3">
        <span className="text-[16px] font-semibold">{totalLabel}</span>
        <span
          className={cn(
            "font-display text-[18px] font-bold",
            accent && "text-primary",
          )}
        >
          {formatTaka(total)}
        </span>
      </div>

      <button
        type="button"
        onClick={section.save}
        disabled={busy || !dirty}
        className="bg-ink focus-visible:outline-primary mt-3.5 min-h-[46px] cursor-pointer rounded-[12px] px-4 text-[15px] font-bold text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {busy ? "সেভ হচ্ছে…" : "সেভ করো"}
      </button>
    </Card>
  );
}
