"use client";

import { useId, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormError } from "@/components/ui/FormError";
import { Input } from "@/components/ui/Input";
import {
  addCategory,
  addEntry,
  listEntries,
  removeEntry,
  spentOnDay,
} from "@/lib/finance/entries";
import { buildMonthSummary } from "@/lib/finance/summary";
import type { MonthData } from "@/lib/finance/types";
import { cn } from "@/lib/utils";
import { CategoryChips } from "./CategoryChips";
import { RecentEntries } from "./RecentEntries";
import { RunningTotals } from "./RunningTotals";

type Reference = {
  year: number;
  monthIndex: number;
  day: number;
};

type AddExpenseScreenProps = {
  initialData: MonthData;
  reference: Reference;
};

const pad = (value: number) => String(value).padStart(2, "0");

function quickDays(today: number) {
  const options = [{ label: "আজ", day: today }];
  if (today > 1) options.push({ label: "গতকাল", day: today - 1 });
  return options;
}

export function AddExpenseScreen({
  initialData,
  reference,
}: AddExpenseScreenProps) {
  const amountId = useId();
  const amountRef = useRef<HTMLInputElement>(null);

  const [data, setData] = useState(initialData);
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState(
    initialData.variable[0]?.id ?? "",
  );
  const [day, setDay] = useState(reference.day);
  const [error, setError] = useState("");

  const summary = useMemo(
    () =>
      buildMonthSummary(
        data,
        new Date(reference.year, reference.monthIndex, reference.day),
      ),
    [data, reference.year, reference.monthIndex, reference.day],
  );

  const entries = useMemo(() => listEntries(data), [data]);
  const selected = summary.categories.find((item) => item.id === categoryId);
  const todaySpent = spentOnDay(data, reference.day);

  const month = `${reference.year}-${pad(reference.monthIndex + 1)}`;

  const handleCreateCategory = (name: string, budget: number) => {
    const id = `c${Date.now()}`;
    setData((current) => addCategory(current, { id, name, budget }));
    setCategoryId(id);
    setError("");
    amountRef.current?.focus();
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const value = Number(amount);

    if (!Number.isFinite(value) || value <= 0) {
      setError("কত টাকা খরচ হলো লিখে দাও।");
      amountRef.current?.focus();
      return;
    }

    if (!categoryId) {
      setError("কোন খাতে খরচ হলো বেছে নাও।");
      return;
    }

    setError("");
    setData((current) => addEntry(current, categoryId, day, value));
    setAmount("");
    amountRef.current?.focus();
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start">
      <Card className="px-6 pt-[26px] pb-7 lg:sticky lg:top-4">
        <form onSubmit={handleSubmit} noValidate>
          <label
            htmlFor={amountId}
            className="text-ink-muted text-[15px] font-medium"
          >
            কত টাকা খরচ হলো?
          </label>

          <div className="border-line-soft mt-1.5 flex items-center gap-1.5 border-b-2 pb-3">
            <span className="font-display text-ink-faint text-[clamp(34px,8vw,48px)] font-semibold">
              ৳
            </span>
            <input
              id={amountId}
              ref={amountRef}
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              autoFocus
              placeholder="0"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="font-display text-ink placeholder:text-ink-faint w-full min-w-[60px] flex-1 border-none bg-transparent text-[clamp(40px,10vw,60px)] font-bold tracking-[-0.02em] outline-none"
            />
          </div>

          <div className="mt-[22px] flex flex-wrap items-end gap-3">
            <div className="w-[190px]">
              <Input
                label="কবে খরচ হলো?"
                type="date"
                value={`${month}-${pad(day)}`}
                min={`${month}-01`}
                max={`${month}-${pad(reference.day)}`}
                onChange={(event) => {
                  const picked = Number(event.target.value.slice(8, 10));
                  if (picked >= 1 && picked <= reference.day) setDay(picked);
                }}
              />
            </div>

            <div className="flex gap-2 pb-0.5">
              {quickDays(reference.day).map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => setDay(option.day)}
                  aria-pressed={day === option.day}
                  className={cn(
                    "focus-visible:outline-primary min-h-[46px] cursor-pointer rounded-full border-[1.5px] px-4 text-[15px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
                    day === option.day
                      ? "border-primary bg-panel text-primary-dark"
                      : "border-line bg-field text-ink-soft hover:border-line-strong",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <CategoryChips
            categories={summary.categories}
            selected={categoryId}
            onSelect={setCategoryId}
            onCreate={handleCreateCategory}
          />

          {error && (
            <div className="mt-4">
              <FormError message={error} />
            </div>
          )}

          <Button type="submit" variant="dark" className="mt-[26px] w-full">
            খরচ যোগ করো
          </Button>

          <p className="text-ink-faint mt-3 text-center text-[14px]">
            {day === reference.day
              ? `তারিখ ধরা হবে আজ, ${day} ${summary.monthName}`
              : `তারিখ ধরা হবে ${day} ${summary.monthName}`}
          </p>
        </form>
      </Card>

      <div className="flex flex-col gap-4">
        <RunningTotals
          summary={summary}
          todaySpent={todaySpent}
          category={selected}
        />
        <RecentEntries
          entries={entries}
          monthName={summary.monthName}
          onRemove={(id) =>
            setData((current) => removeEntry(current, id))
          }
        />
      </div>
    </div>
  );
}
