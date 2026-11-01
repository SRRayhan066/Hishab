"use client";

import { useState, useTransition } from "react";
import { correctBalance } from "@/app/actions/accounts";
import { AmountInput } from "@/components/ui/AmountInput";
import { FormError } from "@/components/ui/FormError";
import { Sheet, SheetTitle } from "@/components/ui/Sheet";
import type { MoneyAccount } from "@/lib/finance/types";
import { useFormat, useT } from "@/lib/i18n/client";

export function CorrectionSheet({
  account,
  onClose,
}: {
  account: MoneyAccount;
  onClose: () => void;
}) {
  const t = useT("accounts");
  const common = useT("common");
  const errorsT = useT("errors");
  const format = useFormat();
  const [amount, setAmount] = useState(String(account.balance));
  const [error, setError] = useState("");
  const [busy, startTransition] = useTransition();
  const difference = (Math.round(Number(amount)) || 0) - account.balance;
  const title = t("correctTitle", { name: account.name });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (amount === "" || difference === 0) return;

    setError("");
    startTransition(async () => {
      try {
        const result = await correctBalance({
          accountId: account.id,
          balance: amount,
        });
        if (result.error) {
          setError(result.error);
          return;
        }
        onClose();
      } catch {
        setError(errorsT("requestFailed"));
      }
    });
  };

  return (
    <Sheet label={title} maxWidth={420} onClose={onClose}>
      <form onSubmit={submit} noValidate className="grid gap-4">
        <SheetTitle title={title} onClose={onClose} />
        <p className="text-ink-soft text-[15px] leading-[1.55]">
          {t("correctBefore")}
          <strong className="text-ink">{format.taka(account.balance)}</strong>
          {t("correctAfter")}
        </p>

        <label className="grid grid-cols-[minmax(0,1fr)] gap-1.5">
          <span className="text-ink-soft text-[14px] font-semibold">
            {t("correctReal")}
          </span>
          <span className="bg-field border-line rounded-field focus-within:border-primary flex h-[54px] items-center gap-2 border px-3.5">
            <span className="font-display text-ink-muted text-[20px] font-bold">
              {format.symbol}
            </span>
            <AmountInput
              value={amount}
              autoFocus
              onChange={(event) => {
                setAmount(event.target.value);
                setError("");
              }}
              className="font-display text-ink w-0 min-w-0 flex-1 border-0 bg-transparent text-[26px] font-bold outline-none"
            />
          </span>
        </label>

        <div className="bg-field text-ink-soft flex justify-between gap-3 rounded-[13px] px-3.5 py-3 text-[14px]">
          <span>{t("correctDifference")}</span>
          <strong aria-live="polite" className="font-display text-ink text-[16px]">
            {format.signedTaka(difference)}
          </strong>
        </div>

        <span className="text-ink-soft text-[13px]">{t("correctNote")}</span>
        <FormError message={error} />

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="border-line bg-surface text-ink focus-visible:outline-primary h-[50px] cursor-pointer rounded-[14px] border text-[15px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60"
          >
            {common("cancel")}
          </button>
          <button
            type="submit"
            disabled={busy || amount === "" || difference === 0}
            className="bg-ink font-display focus-visible:outline-primary h-[50px] cursor-pointer rounded-[14px] text-[16px] font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {busy ? common("saving") : common("save")}
          </button>
        </div>
      </form>
    </Sheet>
  );
}
