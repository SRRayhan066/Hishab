"use client";

import type { MoneyAccount } from "@/lib/finance/types";
import { cn } from "@/lib/utils";

type AccountChipsProps = {
  accounts: MoneyAccount[];
  selected: string;
  onSelect: (id: string) => void;
};

export function AccountChips({
  accounts,
  selected,
  onSelect,
}: AccountChipsProps) {
  return (
    <fieldset className="mt-5">
      <legend className="text-ink-muted text-[15px] font-medium">
        কোন অ্যাকাউন্ট থেকে?
      </legend>

      <div className="mt-2.5 flex flex-wrap gap-2">
        {accounts.map((item) => {
          const active = item.id === selected;

          return (
            <label
              key={item.id}
              className={cn(
                "has-[:focus-visible]:outline-primary flex min-h-[46px] cursor-pointer items-center rounded-full border-[1.5px] px-4 text-[15px] font-semibold transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2",
                active
                  ? "border-primary bg-panel text-primary-dark"
                  : "border-line bg-field text-ink hover:border-line-strong",
              )}
            >
              <input
                type="radio"
                name="account"
                value={item.id}
                checked={active}
                onChange={() => onSelect(item.id)}
                className="sr-only"
              />
              {item.name}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
