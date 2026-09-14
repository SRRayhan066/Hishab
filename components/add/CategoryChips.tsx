"use client";

import { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CategoryStat } from "@/lib/finance/types";

type CategoryChipsProps = {
  categories: CategoryStat[];
  selected: string;
  onSelect: (id: string) => void;
  onCreate: (name: string, budget: number) => void;
};

export function CategoryChips({
  categories,
  selected,
  onSelect,
  onCreate,
}: CategoryChipsProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [budget, setBudget] = useState("");
  const [error, setError] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) nameRef.current?.focus();
  }, [open]);

  const close = () => {
    setOpen(false);
    setName("");
    setBudget("");
    setError("");
  };

  const create = () => {
    const trimmed = name.trim();

    if (!trimmed) {
      setError("খাতের নাম লিখে দাও।");
      return;
    }

    if (categories.some((item) => item.name === trimmed)) {
      setError("এই নামে একটা খাত আগে থেকেই আছে।");
      return;
    }

    const value = Number(budget);
    if (!Number.isFinite(value) || value <= 0) {
      setError("এই খাতে মাসে কত খরচ করতে চাও লিখে দাও।");
      return;
    }

    onCreate(trimmed, value);
    close();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
      create();
    }
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    }
  };

  return (
    <fieldset className="mt-[22px]">
      <legend className="text-ink-muted text-[15px] font-medium">
        কোন খাতে?
      </legend>

      <div className="mt-3 flex flex-wrap gap-2.5">
        {categories.map((category) => {
          const active = category.id === selected;

          return (
            <label
              key={category.id}
              className={cn(
                "has-[:focus-visible]:outline-primary flex min-h-[46px] cursor-pointer items-center rounded-full border-[1.5px] px-5 text-[15px] font-semibold transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2",
                active
                  ? "border-ink bg-ink text-white"
                  : "border-line bg-field text-ink hover:border-line-strong",
              )}
            >
              <input
                type="radio"
                name="category"
                value={category.id}
                checked={active}
                onChange={() => onSelect(category.id)}
                className="sr-only"
              />
              {category.name}
            </label>
          );
        })}

        {!open && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="text-ink-soft hover:border-line-strong hover:text-ink focus-visible:outline-primary flex min-h-[46px] cursor-pointer items-center gap-1.5 rounded-full border-[1.5px] border-dashed border-[#d8d2c4] px-5 text-[15px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <Plus className="h-4 w-4" />
            নতুন খাত
          </button>
        )}
      </div>

      {open && (
        <div className="bg-field border-line mt-3 rounded-[14px] border p-[14px]">
          <div className="flex flex-wrap items-end gap-2.5">
            <div className="flex min-w-[160px] flex-1 flex-col gap-[7px]">
              <label
                htmlFor="new-category-name"
                className="text-ink-soft text-[14px] font-semibold"
              >
                খাতের নাম
              </label>
              <input
                id="new-category-name"
                ref={nameRef}
                value={name}
                onChange={(event) => setName(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="যেমন, বাসার মেরামত"
                className="bg-surface border-line rounded-field text-ink placeholder:text-ink-faint focus:border-primary min-h-[46px] border-[1.5px] px-[14px] text-[15px] outline-none"
              />
            </div>

            <div className="flex w-[150px] flex-col gap-[7px]">
              <label
                htmlFor="new-category-budget"
                className="text-ink-soft text-[14px] font-semibold"
              >
                মাসে কত?
              </label>
              <div className="bg-surface border-line rounded-field focus-within:border-primary flex min-h-[46px] items-center gap-1.5 border-[1.5px] px-[14px]">
                <span className="text-ink-faint text-[16px] font-semibold">
                  ৳
                </span>
                <input
                  id="new-category-budget"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={budget}
                  onChange={(event) => setBudget(event.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="1000"
                  className="text-ink placeholder:text-ink-faint w-full min-w-0 border-none bg-transparent text-[15px] font-semibold outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={create}
                className="bg-primary hover:bg-primary-dark focus-visible:outline-primary min-h-[46px] cursor-pointer rounded-[12px] px-4 text-[15px] font-bold text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                যোগ করো
              </button>
              <button
                type="button"
                onClick={close}
                className="text-ink-soft hover:text-ink focus-visible:outline-primary min-h-[46px] cursor-pointer rounded-[12px] px-3 text-[15px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                বাতিল
              </button>
            </div>
          </div>

          {error ? (
            <p role="alert" className="text-danger mt-2.5 text-[14px] font-medium">
              {error}
            </p>
          ) : (
            <p className="text-ink-faint mt-2.5 text-[14px]">
              নতুন খাত এই মাসের বাজেটে যোগ হবে।
            </p>
          )}
        </div>
      )}
    </fieldset>
  );
}
