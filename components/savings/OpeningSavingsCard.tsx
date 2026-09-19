"use client";

import { useId } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { Card } from "@/components/ui/Card";
import { SaveStatus, type SaveState } from "@/components/budget/SaveStatus";

type OpeningSavingsCardProps = {
  field: UseFormRegisterReturn;
  dirty: boolean;
  busy: boolean;
  state: SaveState;
  error: string;
  onSave: () => void;
};

export function OpeningSavingsCard({
  field,
  dirty,
  busy,
  state,
  error,
  onSave,
}: OpeningSavingsCardProps) {
  const id = useId();

  return (
    <Card className="px-[22px] pt-[22px] pb-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h2 className="font-display text-[18px] font-bold">
          <label htmlFor={id}>আগে থেকে জমানো টাকা</label>
        </h2>
        <SaveStatus state={state} error={error} dirty={dirty} />
      </div>

      <p className="text-ink-muted mt-0.5 text-[14px] leading-[1.55]">
        ব্যাংকে বা হাতে যা আছে, এখানে বসিয়ে দাও। এরপর প্রতি মাসের বাঁচানো টাকা
        নিজে নিজেই এর সাথে যোগ হবে।
      </p>

      <div className="mt-3 flex max-w-[420px] flex-wrap items-center gap-2">
        <span className="text-ink-faint text-[20px] font-semibold">৳</span>
        <input
          {...field}
          id={id}
          type="number"
          inputMode="numeric"
          min={0}
          step={1}
          placeholder="0"
          className="bg-field border-line rounded-field text-ink placeholder:text-ink-faint focus:border-primary focus:bg-surface min-h-[50px] min-w-0 flex-1 border-[1.5px] px-[14px] text-[18px] font-bold outline-none transition-colors"
        />
        <button
          type="button"
          onClick={onSave}
          disabled={busy || !dirty}
          className="bg-ink focus-visible:outline-primary min-h-[50px] cursor-pointer rounded-[12px] px-5 text-[15px] font-bold text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy ? "সেভ হচ্ছে…" : "সেভ করো"}
        </button>
      </div>
    </Card>
  );
}
