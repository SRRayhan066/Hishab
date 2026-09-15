"use client";

import { useId } from "react";
import { Card } from "@/components/ui/Card";

type OpeningSavingsCardProps = {
  value: string;
  onChange: (value: string) => void;
};

export function OpeningSavingsCard({
  value,
  onChange,
}: OpeningSavingsCardProps) {
  const id = useId();

  return (
    <Card className="px-[22px] pt-[22px] pb-6">
      <h2 className="font-display text-[18px] font-bold">
        <label htmlFor={id}>আগে থেকে জমানো টাকা</label>
      </h2>
      <p className="text-ink-muted mt-0.5 text-[14px] leading-[1.55]">
        ব্যাংকে বা হাতে যা আছে, এখানে বসিয়ে দাও। এরপর প্রতি মাসের বাঁচানো টাকা
        নিজে নিজেই এর সাথে যোগ হবে।
      </p>

      <div className="mt-3 flex max-w-[340px] items-center gap-2">
        <span className="text-ink-faint text-[20px] font-semibold">৳</span>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={0}
          step={1}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="0"
          className="bg-field border-line rounded-field text-ink placeholder:text-ink-faint focus:border-primary focus:bg-surface min-h-[50px] min-w-0 flex-1 border-[1.5px] px-[14px] text-[18px] font-bold outline-none transition-colors"
        />
      </div>
    </Card>
  );
}
