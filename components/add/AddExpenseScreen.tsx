"use client";

import {
  useEffect,
  useId,
  useMemo,
  useOptimistic,
  useRef,
  useState,
  useTransition,
} from "react";
import { addCategoryRow } from "@/app/actions/budget";
import { addExpense, removeExpense } from "@/app/actions/expense";
import { AmountInput } from "@/components/ui/AmountInput";
import { Card } from "@/components/ui/Card";
import { FormError } from "@/components/ui/FormError";
import {
  lastUsedAccountId,
  listEntries,
  spentOnDay,
} from "@/lib/finance/entries";
import type { MonthData, MonthSummary } from "@/lib/finance/types";
import { useFormat, useT } from "@/lib/i18n/client";
import { AccountChips } from "./AccountChips";
import { CategoryChips } from "./CategoryChips";
import { DayPicker } from "./DayPicker";
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

export function AddExpenseScreen({
  data,
  summary,
  reference,
}: AddExpenseScreenProps) {
  const amountId = useId();
  const dateId = useId();
  const amountRef = useRef<HTMLInputElement>(null);
  const t = useT("add");
  const errors = useT("errors");
  const common = useT("common");
  const format = useFormat();

  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState(data.categories[0]?.id ?? "");
  const [accountId, setAccountId] = useState(
    () => lastUsedAccountId(listEntries(data)) ?? data.accounts[0]?.id ?? "",
  );
  const [day, setDay] = useState(reference.day);
  const [error, setError] = useState("");
  const [busy, startTransition] = useTransition();
  // Removing gets its own transition so it never puts the add form into its
  // saving state.
  const [, startRemoval] = useTransition();

  // Spending is saved on the server, so the lists below come straight from
  // props — `refresh()` inside each action re-renders this page with the
  // new numbers.
  const entries = useMemo(() => listEntries(data), [data]);
  // A removed row disappears at once and comes back if the delete fails.
  const [visibleEntries, hideEntry] = useOptimistic(
    entries,
    (current, id: string) => current.filter((entry) => entry.id !== id),
  );
  const selected = summary.categories.find((item) => item.id === categoryId);
  const account = data.accounts.find((item) => item.id === accountId);
  const todaySpent = spentOnDay(data, reference.day);
  const value = Math.round(Number(amount)) || 0;
  const overdraw = account !== undefined && value > 0 && value > account.balance;

  // A category deleted on the budget screen, or a month that just rolled
  // over, can leave the selection pointing at nothing.
  useEffect(() => {
    if (!data.categories.some((category) => category.id === categoryId)) {
      setCategoryId(data.categories[0]?.id ?? "");
    }
  }, [data.categories, categoryId]);

  useEffect(() => {
    if (!data.accounts.some((item) => item.id === accountId)) {
      setAccountId(data.accounts[0]?.id ?? "");
    }
  }, [data.accounts, accountId]);

  const handleCreateCategory = (name: string) => {
    setError("");
    startTransition(async () => {
      const result = await addCategoryRow({ name });

      if (result.error || !result.id) {
        setError(result.error ?? errors("saveFailed"));
        return;
      }

      setCategoryId(result.id);
      amountRef.current?.focus();
    });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (value <= 0) {
      setError(errors("expenseAmount"));
      amountRef.current?.focus();
      return;
    }

    if (!categoryId) {
      setError(errors("categoryMissing"));
      return;
    }

    if (!accountId) {
      setError(errors("expenseAccount"));
      return;
    }

    if (overdraw) {
      amountRef.current?.focus();
      return;
    }

    setError("");
    startTransition(async () => {
      const result = await addExpense({ categoryId, accountId, day, amount });

      if (result.error) {
        setError(result.error);
        return;
      }

      setAmount("");
      amountRef.current?.focus();
    });
  };

  const handleRemove = (id: string) => {
    setError("");
    startRemoval(async () => {
      hideEntry(id);
      const result = await removeExpense(id);
      if (result.error) setError(result.error);
    });
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start">
      <Card className="px-[22px] pt-[22px] pb-6 sm:px-6 sm:pt-[26px] sm:pb-7 lg:sticky lg:top-4">
        <form onSubmit={handleSubmit} noValidate>
          <label
            htmlFor={amountId}
            className="text-ink-muted text-[15px] font-medium"
          >
            {t("amountLabel")}
          </label>

          <div className="border-line-soft mt-1.5 flex items-center gap-1.5 border-b-2 pb-2.5">
            <span className="font-display text-ink-faint text-[clamp(28px,7vw,48px)] font-semibold">
              ৳
            </span>
            <AmountInput
              id={amountId}
              ref={amountRef}
              autoFocus
              placeholder="0"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="font-display text-ink placeholder:text-ink-faint w-full min-w-[60px] flex-1 border-none bg-transparent text-[clamp(34px,9vw,60px)] font-bold tracking-[-0.02em] outline-none"
            />
          </div>

          <DayPicker
            id={dateId}
            label={t("dateLabel")}
            year={reference.year}
            monthIndex={reference.monthIndex}
            today={reference.day}
            day={day}
            onChange={setDay}
          />

          <CategoryChips
            categories={summary.categories}
            selected={categoryId}
            onSelect={setCategoryId}
            onCreate={handleCreateCategory}
            busy={busy}
          />

          {data.accounts.length > 1 && (
            <AccountChips
              accounts={data.accounts}
              selected={accountId}
              onSelect={setAccountId}
            />
          )}

          {overdraw && (
            <p aria-live="polite" className="text-danger mt-2.5 text-[14px] font-medium">
              {errors("notEnoughBalance", {
                name: account.name,
                balance: format.taka(account.balance),
              })}
            </p>
          )}

          {error && (
            <div className="mt-4">
              <FormError message={error} />
            </div>
          )}

          <button
            type="submit"
            disabled={busy || overdraw}
            className="bg-ink font-display focus-visible:outline-primary mt-6 min-h-[50px] w-full cursor-pointer rounded-[12px] px-4 text-[16px] font-bold text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? common("saving") : t("submit")}
          </button>

          <p className="text-ink-faint mt-3 text-center text-[14px]">
            {t(day === reference.day ? "dateIsToday" : "dateIs", {
              date: common("dayMonth", {
                day: format.digits(day),
                month: summary.monthName,
              }),
            })}
          </p>
        </form>
      </Card>

      <div className="flex flex-col gap-4">
        <RunningTotals
          summary={summary}
          todaySpent={todaySpent}
          category={selected}
          account={data.accounts.length > 1 ? account : undefined}
        />
        <RecentEntries
          entries={visibleEntries}
          monthName={summary.monthName}
          onRemove={handleRemove}
        />
      </div>
    </div>
  );
}
