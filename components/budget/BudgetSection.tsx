"use client";

import { useEffect, useRef } from "react";
import { Plus } from "lucide-react";
import type {
  FieldArrayWithId,
  UseFieldArrayRemove,
  UseFormRegister,
} from "react-hook-form";
import { Card } from "@/components/ui/Card";
import { formatTaka } from "@/lib/finance/format";
import { cn } from "@/lib/utils";
import { SaveStatus, type SaveState } from "./SaveStatus";
import type { PlanFormValues, PlanSectionName } from "./plan-form";

export type RowNote = {
  note?: string;
  noteTone?: "muted" | "warn";
};

type BudgetSectionProps = {
  name: PlanSectionName;
  title: string;
  hint: string;
  fields: FieldArrayWithId<PlanFormValues, PlanSectionName, "key">[];
  notes: Record<string, RowNote>;
  register: UseFormRegister<PlanFormValues>;
  remove: UseFieldArrayRemove;
  namePlaceholder: string;
  emptyLabel: string;
  addLabel: string;
  totalLabel: string;
  total: number;
  accent?: boolean;
  /** Index of a row whose name box should take focus — set when one is added. */
  focusIndex: number | null;
  dirty: boolean;
  busy: boolean;
  state: SaveState;
  error: string;
  onAdd: () => void;
  onSave: () => void;
  onDirty: () => void;
  className?: string;
};

export function BudgetSection({
  name,
  title,
  hint,
  fields,
  notes,
  register,
  remove,
  namePlaceholder,
  emptyLabel,
  addLabel,
  totalLabel,
  total,
  accent = false,
  focusIndex,
  dirty,
  busy,
  state,
  error,
  onAdd,
  onSave,
  onDirty,
  className,
}: BudgetSectionProps) {
  const nameRefs = useRef(new Map<number, HTMLInputElement | null>());

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
          {fields.map((field, index) => {
            const rowNote = notes[field.id] ?? {};
            const nameField = register(`${name}.${index}.name`, {
              onChange: onDirty,
            });

            return (
              <li key={field.key} className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <input
                    {...nameField}
                    ref={(node) => {
                      nameField.ref(node);
                      nameRefs.current.set(index, node);
                    }}
                    placeholder={namePlaceholder}
                    aria-label={`${namePlaceholder} ${index + 1}`}
                    className="bg-field border-line rounded-field text-ink placeholder:text-ink-faint focus:border-primary focus:bg-surface min-h-[46px] min-w-0 flex-1 border-[1.5px] px-[14px] text-[15px] outline-none transition-colors"
                  />

                  <div className="bg-field border-line rounded-field focus-within:border-primary focus-within:bg-surface flex min-h-[46px] w-[112px] flex-none items-center gap-1 border-[1.5px] px-[11px] transition-colors">
                    <span className="text-ink-faint text-[15px] font-semibold">
                      ৳
                    </span>
                    <input
                      {...register(`${name}.${index}.amount`, {
                        onChange: onDirty,
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
                    onClick={() => {
                      remove(index);
                      onDirty();
                    }}
                    disabled={busy}
                    aria-label={`${namePlaceholder} ${index + 1} মুছে ফেলো`}
                    className="border-line text-ink-faint hover:border-danger-line hover:text-danger focus-visible:outline-primary flex h-[46px] w-[46px] flex-none cursor-pointer items-center justify-center rounded-[12px] border-[1.5px] text-[20px] leading-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
        onClick={onAdd}
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
        onClick={onSave}
        disabled={busy || !dirty}
        className="bg-ink focus-visible:outline-primary mt-3.5 min-h-[46px] cursor-pointer rounded-[12px] px-4 text-[15px] font-bold text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {busy ? "সেভ হচ্ছে…" : "সেভ করো"}
      </button>
    </Card>
  );
}
