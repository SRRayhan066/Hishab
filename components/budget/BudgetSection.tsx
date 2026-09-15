"use client";

import { useEffect, useRef } from "react";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { formatTaka } from "@/lib/finance/format";
import { cn } from "@/lib/utils";

export type SectionRow = {
  id: string;
  name: string;
  amount: string;
  note?: string;
  noteTone?: "muted" | "warn";
};

type BudgetSectionProps = {
  title: string;
  hint: string;
  rows: SectionRow[];
  namePlaceholder: string;
  emptyLabel: string;
  addLabel: string;
  totalLabel: string;
  total: number;
  accent?: boolean;
  focusId: string | null;
  onNameChange: (id: string, value: string) => void;
  onAmountChange: (id: string, value: string) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
  className?: string;
};

export function BudgetSection({
  title,
  hint,
  rows,
  namePlaceholder,
  emptyLabel,
  addLabel,
  totalLabel,
  total,
  accent = false,
  focusId,
  onNameChange,
  onAmountChange,
  onRemove,
  onAdd,
  className,
}: BudgetSectionProps) {
  const nameRefs = useRef(new Map<string, HTMLInputElement | null>());

  useEffect(() => {
    if (focusId) nameRefs.current.get(focusId)?.focus();
  }, [focusId]);

  return (
    <Card className={cn("flex flex-col px-[22px] pt-[22px] pb-6", className)}>
      <h2 className="font-display text-[18px] font-bold">{title}</h2>
      <p className="text-ink-muted mt-0.5 text-[14px]">{hint}</p>

      {rows.length === 0 ? (
        <p className="text-ink-faint pt-4 text-[15px]">{emptyLabel}</p>
      ) : (
        <ul className="mt-3.5 flex flex-col gap-2.5">
          {rows.map((row) => {
            const label = row.name.trim() || namePlaceholder;

            return (
              <li key={row.id} className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <input
                    ref={(node) => {
                      nameRefs.current.set(row.id, node);
                    }}
                    value={row.name}
                    onChange={(event) => onNameChange(row.id, event.target.value)}
                    placeholder={namePlaceholder}
                    aria-label={`${label} — খাতের নাম`}
                    className="bg-field border-line rounded-field text-ink placeholder:text-ink-faint focus:border-primary focus:bg-surface min-h-[46px] min-w-0 flex-1 border-[1.5px] px-[14px] text-[15px] outline-none transition-colors"
                  />

                  <div className="bg-field border-line rounded-field focus-within:border-primary focus-within:bg-surface flex min-h-[46px] w-[112px] flex-none items-center gap-1 border-[1.5px] px-[11px] transition-colors">
                    <span className="text-ink-faint text-[15px] font-semibold">
                      ৳
                    </span>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      step={1}
                      value={row.amount}
                      onChange={(event) =>
                        onAmountChange(row.id, event.target.value)
                      }
                      placeholder="0"
                      aria-label={`${label} — মাসে কত টাকা`}
                      className={cn(
                        "placeholder:text-ink-faint w-full min-w-0 border-none bg-transparent text-right text-[15px] font-bold outline-none",
                        accent ? "text-primary" : "text-ink",
                      )}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemove(row.id)}
                    aria-label={`${label} মুছে ফেলো`}
                    className="border-line text-ink-faint hover:border-danger-line hover:text-danger focus-visible:outline-primary flex h-[46px] w-[46px] flex-none cursor-pointer items-center justify-center rounded-[12px] border-[1.5px] text-[20px] leading-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    ×
                  </button>
                </div>

                {row.note && (
                  <p
                    className={cn(
                      "pl-[15px] text-[13px]",
                      row.noteTone === "warn"
                        ? "text-danger font-medium"
                        : "text-ink-faint",
                    )}
                  >
                    {row.note}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <button
        type="button"
        onClick={onAdd}
        className="text-ink-soft hover:border-line-strong hover:text-ink focus-visible:outline-primary mt-2.5 flex min-h-[46px] cursor-pointer items-center justify-center gap-1.5 rounded-[12px] border-[1.5px] border-dashed border-[#d8d2c4] px-4 text-[15px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <Plus className="h-4 w-4" />
        {addLabel}
      </button>

      <div className="mt-4 flex justify-between gap-3 border-t-[1.5px] border-[#f0ebe1] pt-3">
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
    </Card>
  );
}
