"use client";

import { useEffect, useId, useState, useTransition } from "react";
import { ArrowDownUp, WalletMinimal } from "lucide-react";
import { addTransfer } from "@/app/actions/accounts";
import { DayPicker } from "@/components/add/DayPicker";
import { AmountInput } from "@/components/ui/AmountInput";
import { Card } from "@/components/ui/Card";
import { FormError } from "@/components/ui/FormError";
import { Select, type SelectOption } from "@/components/ui/Select";
import { useFormat, useT } from "@/lib/i18n/client";
import type { MoneyAccount } from "@/lib/finance/types";
import { cn } from "@/lib/utils";

type TransferCardProps = {
  accounts: MoneyAccount[];
  reference: { year: number; monthIndex: number; day: number };
};

export function TransferCard({ accounts, reference }: TransferCardProps) {
  const t = useT("accounts");
  const common = useT("common");
  const errorsT = useT("errors");
  const format = useFormat();
  const fromId = useId();
  const toId = useId();
  const amountId = useId();
  const dateId = useId();

  const [from, setFrom] = useState(accounts[0]?.id ?? "");
  const [to, setTo] = useState(accounts[1]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [day, setDay] = useState(reference.day);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const [busy, startTransition] = useTransition();

  useEffect(() => {
    const ids = accounts.map((account) => account.id);
    if (!ids.includes(from)) setFrom(ids[0] ?? "");
    if (!ids.includes(to)) setTo(ids.find((id) => id !== from) ?? "");
  }, [accounts, from, to]);

  if (accounts.length < 2) {
    return (
      <Card className="px-[22px] pt-[22px] pb-6">
        <h2 className="font-display text-[18px] font-bold">{t("transferTitle")}</h2>
        <p className="text-ink-muted mt-1 text-[15px] leading-[1.55]">
          {t("transferNeedTwo")}
        </p>
      </Card>
    );
  }

  const options: SelectOption[] = accounts.map((account) => ({
    value: account.id,
    label: account.name,
    hint: t("has", { amount: format.taka(account.balance) }),
  }));
  const source = accounts.find((account) => account.id === from);
  const target = accounts.find((account) => account.id === to);

  const pickFrom = (id: string) => {
    if (id === to) setTo(from);
    setFrom(id);
  };

  const pickTo = (id: string) => {
    if (id === from) setFrom(to);
    setTo(id);
  };

  const swap = () => {
    setFrom(to);
    setTo(from);
  };
  const value = Math.round(Number(amount)) || 0;
  const overdraw = source !== undefined && value > 0 && value > source.balance;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (value <= 0) {
      setError(errorsT("transferAmount"));
      return;
    }

    if (from === to) {
      setError(errorsT("transferSameAccount"));
      return;
    }

    if (overdraw) return;

    setError("");
    setDone("");
    startTransition(async () => {
      const result = await addTransfer({ fromId: from, toId: to, day, amount });

      if (result.error) {
        setError(result.error);
        return;
      }

      setAmount("");
      setDone(t("done"));
    });
  };

  return (
    <Card className="px-[22px] pt-[22px] pb-6">
      <form onSubmit={handleSubmit} noValidate>
        <h2 className="font-display text-[18px] font-bold">{t("transferTitle")}</h2>
        <p className="text-ink-muted mt-0.5 text-[14px] leading-[1.55]">
          {t("transferHint")}
        </p>

        <div className="mt-4">
          <AccountField
            id={fromId}
            label={t("from")}
            value={from}
            options={options}
            balance={source?.balance}
            onChange={pickFrom}
          />

          <div className="my-2 flex items-center gap-3">
            <span className="bg-line-soft h-[1.5px] flex-1" />
            <button
              type="button"
              onClick={swap}
              aria-label={t("swap")}
              title={t("swapTitle")}
              className="border-line bg-surface text-ink-soft hover:border-primary hover:text-primary focus-visible:outline-primary flex h-10 w-10 flex-none cursor-pointer items-center justify-center rounded-full border-[1.5px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <ArrowDownUp className="h-[18px] w-[18px]" />
            </button>
            <span className="bg-line-soft h-[1.5px] flex-1" />
          </div>

          <AccountField
            id={toId}
            label={t("to")}
            value={to}
            options={options}
            balance={target?.balance}
            onChange={pickTo}
          />
        </div>

        <label
          htmlFor={amountId}
          className="text-ink-muted mt-5 block text-[15px] font-medium"
        >
          {t("amount")}
        </label>
        <div className="bg-field border-line rounded-field focus-within:border-primary focus-within:bg-surface mt-2 flex min-h-[50px] items-center gap-1.5 border-[1.5px] px-[14px] transition-colors">
          <span className="text-ink-faint text-[18px] font-semibold">৳</span>
          <AmountInput
            id={amountId}
            placeholder="0"
            value={amount}
            onChange={(event) => {
              setAmount(event.target.value);
              setDone("");
            }}
            className="placeholder:text-ink-faint text-ink w-full min-w-0 border-none bg-transparent text-[18px] font-bold outline-none"
          />
        </div>

        {overdraw && (
          <p aria-live="polite" className="text-danger mt-2.5 text-[14px] font-medium">
            {errorsT("notEnoughBalance", {
              name: source.name,
              balance: format.taka(source.balance),
            })}
          </p>
        )}

        <DayPicker
          id={dateId}
          label={t("when")}
          year={reference.year}
          monthIndex={reference.monthIndex}
          today={reference.day}
          day={day}
          onChange={setDay}
        />

        {error && (
          <div className="mt-4">
            <FormError message={error} />
          </div>
        )}

        <button
          type="submit"
          disabled={busy || overdraw}
          className="bg-ink font-display focus-visible:outline-primary mt-5 min-h-[50px] w-full cursor-pointer rounded-[12px] px-4 text-[16px] font-bold text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? common("saving") : t("submit")}
        </button>

        {done && (
          <p aria-live="polite" className="text-primary-dark mt-3 text-center text-[14px] font-medium">
            {done}
          </p>
        )}
      </form>
    </Card>
  );
}

type AccountFieldProps = {
  id: string;
  label: string;
  value: string;
  options: SelectOption[];
  balance: number | undefined;
  onChange: (id: string) => void;
};

function AccountField({
  id,
  label,
  value,
  options,
  balance,
  onChange,
}: AccountFieldProps) {
  const t = useT("accounts");
  const format = useFormat();
  const labelId = `${id}-label`;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <span id={labelId} className="text-ink-muted text-[14px] font-medium">
          {label}
        </span>
        {balance !== undefined && (
          <span
            className={cn(
              "text-[13px]",
              balance < 0 ? "text-danger font-medium" : "text-ink-faint",
            )}
          >
            {t("has", { amount: format.taka(balance) })}
          </span>
        )}
      </div>
      <Select
        id={id}
        value={value}
        options={options}
        onChange={onChange}
        icon={<WalletMinimal className="h-4 w-4" />}
        aria-labelledby={labelId}
      />
    </div>
  );
}
