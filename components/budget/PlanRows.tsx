"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { Controller } from "react-hook-form";
import { AmountInput } from "@/components/ui/AmountInput";
import { Card } from "@/components/ui/Card";
import { FormError } from "@/components/ui/FormError";
import { Select, type SelectOption } from "@/components/ui/Select";
import { useFormat, useT } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";
import type { PlanSection } from "./usePlanSection";

type PlanRowsProps = {
  section: PlanSection;
  title: string;
  total: number;
  accent?: boolean;
  namePlaceholder: string;
  emptyLabel: string;
  addLabel: string;
  accounts?: { id: string; name: string }[];
  detail: (index: number, id: string) => ReactNode;
};

export function PlanRows({
  section,
  title,
  total,
  accent = false,
  namePlaceholder,
  emptyLabel,
  addLabel,
  accounts,
  detail,
}: PlanRowsProps) {
  const t = useT("budget");
  const format = useFormat();
  const { control, register, fields, focusIndex, busy, error, dirtyRows } = section;
  const nameRefs = useRef(new Map<number, HTMLInputElement | null>());
  const accountOptions: SelectOption[] = (accounts ?? []).map((account) => ({
    value: account.id,
    label: account.name,
  }));

  useEffect(() => {
    if (focusIndex !== null) nameRefs.current.get(focusIndex)?.focus();
  }, [focusIndex, fields.length]);

  return (
    <Card className="grid grid-cols-[minmax(0,1fr)] p-5 md:p-6">
      <div className="mb-2 flex items-baseline justify-between gap-2.5">
        <h2 className="font-display text-[19px] font-bold">{title}</h2>
        <span
          className={cn(
            "font-display text-[17px] font-bold",
            accent && "text-primary-dark",
          )}
        >
          {format.taka(total)}
        </span>
      </div>

      <FormError message={error} />

      {fields.length === 0 ? (
        <p className="text-ink-soft border-t border-[#f4f0e7] py-3 text-[15px]">
          {emptyLabel}
        </p>
      ) : (
        <ul>
          {fields.map((field, index) => {
            const row = `${namePlaceholder} ${format.digits(index + 1)}`;
            const nameField = register(`rows.${index}.name`, {
              onChange: section.edited,
            });

            return (
              <li
                key={field.key}
                className="grid grid-cols-[minmax(0,1fr)_116px_32px] items-center gap-x-2 gap-y-1.5 border-t border-[#f4f0e7] py-3 md:grid-cols-[minmax(0,1fr)_128px_32px]"
              >
                <input
                  {...nameField}
                  ref={(node) => {
                    nameField.ref(node);
                    nameRefs.current.set(index, node);
                  }}
                  placeholder={namePlaceholder}
                  aria-label={t("rowName", { row })}
                  className="placeholder:text-ink-muted focus:bg-field hover:bg-field -ml-2 h-11 min-w-0 rounded-[10px] bg-transparent px-2 text-[15px] font-semibold outline-none transition-colors"
                />
                <label
                  className={cn(
                    "bg-field focus-within:border-primary rounded-field flex h-11 items-center gap-0.5 border px-3",
                    dirtyRows?.[index]?.amount ? "border-primary" : "border-line",
                  )}
                >
                  <span className="font-display text-ink-muted font-bold">
                    {format.symbol}
                  </span>
                  <AmountInput
                    {...register(`rows.${index}.amount`, {
                      onChange: section.edited,
                    })}
                    placeholder="0"
                    aria-label={t("rowAmount", { row })}
                    className="font-display text-ink w-0 min-w-0 flex-1 border-0 bg-transparent text-right text-[17px] font-bold outline-none"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => section.removeRow(index)}
                  disabled={busy}
                  aria-label={t("rowRemove", { row })}
                  className="text-ink-muted hover:text-danger focus-visible:outline-primary -mr-1.5 flex h-9 w-9 cursor-pointer items-center justify-center rounded-[10px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X className="h-[18px] w-[18px]" />
                </button>

                <div className="col-span-full grid min-w-0 gap-1.5">
                  {accounts && accounts.length > 1 ? (
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
                            <span className="text-ink-soft text-[14px] font-medium">
                              {t("depositsTo")}
                            </span>
                          }
                          aria-label={t("rowAccount", { row })}
                        />
                      )}
                    />
                  ) : (
                    detail(index, field.id)
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <button
        type="button"
        onClick={section.add}
        className="text-ink-soft hover:border-line-strong hover:text-ink focus-visible:outline-primary mt-2 h-[46px] cursor-pointer rounded-[13px] border border-dashed border-[#d8d2c4] text-[15px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        + {addLabel}
      </button>
    </Card>
  );
}
