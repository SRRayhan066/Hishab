"use client";

import { Card } from "@/components/ui/Card";
import { PasswordInput } from "@/components/ui/PasswordInput";

export function PasswordCard() {
  return (
    <Card className="px-[22px] pt-[22px] pb-6">
      <form onSubmit={(event) => event.preventDefault()} noValidate>
        <h2 className="font-display text-[18px] font-bold">পাসওয়ার্ড বদলানো</h2>
        <p className="text-ink-muted mt-0.5 text-[14px] leading-[1.55]">
          নতুন পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে। বদলানোর পর অন্য ডিভাইসেও নতুনটা
          দিয়ে ঢুকতে হবে।
        </p>

        <div className="mt-4 flex flex-col gap-4">
          <PasswordInput
            label="এখনকার পাসওয়ার্ড"
            autoComplete="current-password"
            placeholder="••••••"
          />
          <PasswordInput
            label="নতুন পাসওয়ার্ড"
            autoComplete="new-password"
            placeholder="অন্তত ৬ অক্ষর"
          />
          <PasswordInput
            label="নতুন পাসওয়ার্ড আবার"
            autoComplete="new-password"
            placeholder="আরেকবার লেখো"
          />
        </div>

        <button
          type="submit"
          className="bg-ink font-display focus-visible:outline-primary mt-5 min-h-[50px] w-full cursor-pointer rounded-[12px] px-4 text-[16px] font-bold text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
        >
          পাসওয়ার্ড বদলাও
        </button>
      </form>
    </Card>
  );
}
