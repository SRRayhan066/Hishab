"use client";

import { useEffect, useId, useMemo, useRef, useState, useTransition } from "react";
import { addCategoryRow } from "@/app/actions/budget";
import { addExpense, removeExpense } from "@/app/actions/expense";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormError } from "@/components/ui/FormError";
import { Input } from "@/components/ui/Input";
import { listEntries, spentOnDay } from "@/lib/finance/entries";
import { saveFailedError } from "@/lib/finance/messages";
import type { MonthData, MonthSummary } from "@/lib/finance/types";
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
  data: MonthData;
  summary: MonthSummary;
  reference: Reference;
};

const pad = (value: number) => String(value).padStart(2, "0");

function quickDays(today: number) {
  const options = [{ label: "আজ", day: today }];
  if (today > 1) options.push({ label: "গতকাল", day: today - 1 });
  return options;
}

export function AddExpenseScreen({
  data,
  summary,
  reference,
}: AddExpenseScreenProps) {
  const amountId = useId();
  const amountRef = useRef<HTMLInputElement>(null);

  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState(data.categories[0]?.id ?? "");
  const [day, setDay] = useState(reference.day);
  const [error, setError] = useState("");
  const [busy, startTransition] = useTransition();

  // Spending is saved on the server, so the lists below come straight from
  // props — `refresh()` inside each action re-renders this page with the
  // new numbers.
  const entries = useMemo(() => listEntries(data), [data]);
  const selected = summary.categories.find((item) => item.id === categoryId);
  const todaySpent = spentOnDay(data, reference.day);

  const month = `${reference.year}-${pad(reference.monthIndex + 1)}`;

  // A category deleted on the budget screen, or a month that just rolled
  // over, can leave the selection pointing at nothing.
  useEffect(() => {
    if (!data.categories.some((category) => category.id === categoryId)) {
      setCategoryId(data.categories[0]?.id ?? "");
    }
  }, [data.categories, categoryId]);

  const handleCreateCategory = (name: string, budget: number) => {
    setError("");
    startTransition(async () => {
      const result = await addCategoryRow({ name, budget });

      if (result.error || !result.id) {
        setError(result.error ?? saveFailedError);
        return;
      }

      setCategoryId(result.id);
      amountRef.current?.focus();
    });
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
    startTransition(async () => {
      const result = await addExpense({ categoryId, day, amount });

      if (result.error) {
        setError(result.error);
        return;
      }

      setAmount("");
      amountRef.current?.focus();
    });
  };

  const handleRemove = (id: string) => {
    startTransition(async () => {
      const result = await removeExpense(id);
      if (result.error) setError(result.error);
    });
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
            busy={busy}
          />

          {error && (
            <div className="mt-4">
              <FormError message={error} />
            </div>
          )}

          <Button
            type="submit"
            variant="dark"
            className="mt-[26px] w-full"
            disabled={busy}
          >
            {busy ? "সেভ হচ্ছে…" : "খরচ যোগ করো"}
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
          onRemove={handleRemove}
        />
      </div>
    </div>
  );
}
