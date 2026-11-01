"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { addCategoryRow } from "@/app/actions/budget";
import { addExpense } from "@/app/actions/expense";
import { useFormat, useT } from "@/lib/i18n/client";
import {
  AccountChips,
  AmountField,
  ChipGroup,
  DayField,
  FormFoot,
  amountValue,
  chipClass,
  dashedChip,
  pendingAdd,
  pendingBox,
  pendingCancel,
  pendingInput,
  type FormProps,
} from "./fields";

export function SpendForm({ context, amount, onAmount, onDone }: FormProps) {
  const t = useT("entry");
  const common = useT("common");
  const errors = useT("errors");
  const format = useFormat();
  const { accounts, categories, today, period } = context;

  const [picked, setPicked] = useState(categories[0]?.id ?? "");
  const [accountId, setAccountId] = useState(
    context.lastAccountId ?? accounts[0]?.id ?? "",
  );
  const [day, setDay] = useState(today);
  const [newCategory, setNewCategory] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [busy, startTransition] = useTransition();

  const categoryId = categories.some((item) => item.id === picked)
    ? picked
    : (categories[0]?.id ?? "");
  const account = accounts.find((item) => item.id === accountId) ?? accounts[0];
  const value = amountValue(amount);
  const overdraw = account !== undefined && value > account.balance;
  const trimmed = newCategory?.trim() ?? "";
  const duplicate =
    trimmed !== "" &&
    categories.some(
      (item) => item.name.toLocaleLowerCase() === trimmed.toLocaleLowerCase(),
    );
  const date = common("dayMonth", {
    day: format.digits(day),
    month: format.month(period.month - 1),
  });
  const footnote = t(
    day === today
      ? "footnoteToday"
      : day === today - 1
        ? "footnoteYesterday"
        : "footnoteDay",
    { date, account: account?.name ?? "" },
  );

  const createCategory = () => {
    if (!trimmed || duplicate) return;

    setError("");
    startTransition(async () => {
      const result = await addCategoryRow({ name: trimmed });
      if (result.error || !result.id) {
        setError(result.error ?? errors("saveFailed"));
        return;
      }
      setPicked(result.id);
      setNewCategory(null);
    });
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (value <= 0 || overdraw || !account) return;
    if (!categoryId) {
      setError(errors("categoryMissing"));
      return;
    }

    setError("");
    startTransition(async () => {
      const result = await addExpense({
        categoryId,
        accountId: account.id,
        day,
        amount,
      });
      if (result.error) {
        setError(result.error);
        return;
      }
      onDone();
    });
  };

  return (
    <form
      onSubmit={submit}
      noValidate
      className="grid grid-cols-[minmax(0,1fr)] gap-[18px]"
    >
      <AmountField amount={amount} onAmount={onAmount} invalid={overdraw} />

      <div className="grid gap-2">
        <ChipGroup label={t("category")}>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              aria-pressed={category.id === categoryId}
              onClick={() => setPicked(category.id)}
              className={chipClass(category.id === categoryId, "ink")}
            >
              {category.name}
            </button>
          ))}
          {newCategory === null && (
            <button
              type="button"
              onClick={() => setNewCategory("")}
              className={dashedChip}
            >
              <Plus className="h-[18px] w-[18px]" />
              {t("newCategory")}
            </button>
          )}
        </ChipGroup>

        {newCategory !== null && (
          <div className={pendingBox}>
            <input
              value={newCategory}
              onChange={(event) => setNewCategory(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  createCategory();
                }
              }}
              maxLength={60}
              autoFocus
              placeholder={t("categoryPlaceholder")}
              aria-label={t("newCategory")}
              className={pendingInput}
            />
            {duplicate && (
              <span role="alert" className="text-danger text-[13px]">
                {errors("categoryExists")}
              </span>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={createCategory}
                disabled={!trimmed || duplicate || busy}
                className={pendingAdd}
              >
                {common("add")}
              </button>
              <button
                type="button"
                onClick={() => setNewCategory(null)}
                className={pendingCancel}
              >
                {common("cancel")}
              </button>
            </div>
            <span className="text-ink-soft text-[13px] leading-[1.5]">
              {t("temporaryHint")}
            </span>
          </div>
        )}
      </div>

      <AccountChips
        label={t("fromAccount")}
        accounts={accounts}
        selected={account?.id ?? ""}
        onSelect={setAccountId}
      />

      <DayField period={period} today={today} day={day} onChange={setDay} />

      <FormFoot
        error={
          error ||
          (overdraw
            ? t("overdrawSpend", {
                name: account.name,
                balance: format.taka(account.balance),
              })
            : "")
        }
        disabled={value <= 0 || overdraw}
        busy={busy}
        label={t("submitSpend")}
        footnote={footnote}
      />
    </form>
  );
}
