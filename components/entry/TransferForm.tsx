"use client";

import { useState, useTransition } from "react";
import { ArrowDownUp } from "lucide-react";
import { addTransfer } from "@/app/actions/accounts";
import { AccountIcon } from "@/components/accounts/AccountCard";
import { Select, type SelectOption } from "@/components/ui/Select";
import { useFormat, useT } from "@/lib/i18n/client";
import {
  AmountField,
  DayField,
  FormFoot,
  Preview,
  amountValue,
  fieldLabel,
  type FormProps,
} from "./fields";

export function TransferForm({ context, amount, onAmount, onDone }: FormProps) {
  const t = useT("entry");
  const format = useFormat();
  const { accounts, today, period } = context;

  const [from, setFrom] = useState(accounts[0]?.id ?? "");
  const [to, setTo] = useState(accounts[1]?.id ?? "");
  const [day, setDay] = useState(today);
  const [error, setError] = useState("");
  const [busy, startTransition] = useTransition();

  if (accounts.length < 2) {
    return (
      <p className="text-ink-soft text-[15px] leading-[1.55]">
        {t("needTwoAccounts")}
      </p>
    );
  }

  const source = accounts.find((account) => account.id === from);
  const target = accounts.find((account) => account.id === to);
  const value = amountValue(amount);
  const overdraw = source !== undefined && value > source.balance;
  const options: SelectOption[] = accounts.map((account) => ({
    value: account.id,
    label: account.name,
    hint: t("balance", { amount: format.taka(account.balance) }),
    icon: <AccountIcon icon={account.icon} className="h-[19px] w-[19px]" />,
  }));

  const pickFrom = (id: string) => {
    if (id === to) setTo(from);
    setFrom(id);
  };

  const pickTo = (id: string) => {
    if (id === from) setFrom(to);
    setTo(id);
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (value <= 0 || overdraw) return;

    setError("");
    startTransition(async () => {
      const result = await addTransfer({ fromId: from, toId: to, day, amount });
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

      <div className="grid gap-2.5">
        <div className="grid gap-1.5">
          <span id="transfer-from" className={fieldLabel}>
            {t("fromLabel")}
          </span>
          <Select
            rich
            value={from}
            options={options}
            onChange={pickFrom}
            aria-labelledby="transfer-from"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <span className="bg-line-soft h-px flex-1" />
          <button
            type="button"
            onClick={() => {
              setFrom(to);
              setTo(from);
            }}
            aria-label={t("swap")}
            className="border-line bg-surface text-ink-soft hover:border-primary hover:text-primary focus-visible:outline-primary flex h-11 w-11 cursor-pointer items-center justify-center rounded-[12px] border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <ArrowDownUp className="h-5 w-5" />
          </button>
          <span className="bg-line-soft h-px flex-1" />
        </div>

        <div className="grid gap-1.5">
          <span id="transfer-to" className={fieldLabel}>
            {t("to")}
          </span>
          <Select
            rich
            value={to}
            options={options}
            onChange={pickTo}
            aria-labelledby="transfer-to"
          />
        </div>
      </div>

      <DayField period={period} today={today} day={day} onChange={setDay} />

      {value > 0 && source && target && (
        <Preview
          lines={[
            {
              label: source.name,
              before: format.taka(source.balance),
              after: format.taka(source.balance - value),
            },
            {
              label: target.name,
              before: format.taka(target.balance),
              after: format.taka(target.balance + value),
            },
          ]}
        />
      )}

      <FormFoot
        error={
          error ||
          (overdraw && source
            ? t("overdraw", {
                name: source.name,
                balance: format.taka(source.balance),
              })
            : "")
        }
        disabled={value <= 0 || overdraw}
        busy={busy}
        label={t("submitTransfer")}
        footnote={t("transferFootnote")}
      />
    </form>
  );
}
