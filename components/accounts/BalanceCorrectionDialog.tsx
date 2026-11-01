"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { correctBalance } from "@/app/actions/accounts";
import { AmountInput } from "@/components/ui/AmountInput";
import { FormError } from "@/components/ui/FormError";
import { useFormat, useT } from "@/lib/i18n/client";
import type { MoneyAccount } from "@/lib/finance/types";

type BalanceCorrectionDialogProps = {
  account: MoneyAccount;
  onClose: () => void;
};

export function BalanceCorrectionDialog({
  account,
  onClose,
}: BalanceCorrectionDialogProps) {
  const t = useT("accounts");
  const common = useT("common");
  const errorsT = useT("errors");
  const format = useFormat();
  const titleId = useId();
  const amountId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [busy, startTransition] = useTransition();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const entered = amount !== "";
  const difference = Math.round(Number(amount)) - account.balance;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!entered || difference === 0) return;

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
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      className="bg-surface text-ink animate-pop-in m-auto w-[calc(100%-32px)] max-w-[420px] rounded-[20px] px-[22px] pt-[22px] pb-6 backdrop:bg-black/40"
    >
      <form onSubmit={handleSubmit} noValidate>
        <h2 id={titleId} className="font-display text-[18px] font-bold">
          {t("correctTitle", { name: account.name })}
        </h2>
        <p className="text-ink-muted mt-0.5 text-[14px] leading-[1.55]">
          {t("correctHint")}
        </p>

        <div className="bg-field mt-4 flex items-baseline justify-between gap-3 rounded-[12px] px-[14px] py-3">
          <span className="text-ink-muted text-[14px]">{t("correctShown")}</span>
          <span className="font-display text-[18px] font-bold">
            {format.taka(account.balance)}
          </span>
        </div>

        <label
          htmlFor={amountId}
          className="text-ink-muted mt-4 block text-[15px] font-medium"
        >
          {t("correctReal")}
        </label>
        <div className="bg-field border-line rounded-field focus-within:border-primary focus-within:bg-surface mt-2 flex min-h-[50px] items-center gap-1.5 border-[1.5px] px-[14px] transition-colors">
          <span className="text-ink-faint text-[18px] font-semibold">৳</span>
          <AmountInput
            id={amountId}
            placeholder="0"
            value={amount}
            autoFocus
            onChange={(event) => {
              setAmount(event.target.value);
              setError("");
            }}
            className="placeholder:text-ink-faint text-ink w-full min-w-0 border-none bg-transparent text-[18px] font-bold outline-none"
          />
        </div>

        {entered && (
          <p aria-live="polite" className="text-ink-soft mt-2.5 text-[14px] font-medium">
            {difference === 0
              ? t("correctSame")
              : t(difference < 0 ? "correctLess" : "correctMore", {
                  amount: format.taka(Math.abs(difference)),
                })}
          </p>
        )}

        <p className="text-ink-muted mt-3 text-[14px] leading-[1.55]">
          {t("correctNote")}
          {entered && difference < 0 && (
            <>
              {" "}
              <Link href="/add" className="text-primary-dark font-semibold underline">
                {t("correctLogExpense")}
              </Link>
            </>
          )}
        </p>

        {error && (
          <div className="mt-3">
            <FormError message={error} />
          </div>
        )}

        <div className="mt-4 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="bg-surface border-line text-ink hover:border-line-strong focus-visible:outline-primary min-h-[48px] cursor-pointer rounded-[12px] border-[1.5px] px-5 text-[15px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {t("correctCancel")}
          </button>
          <button
            type="submit"
            disabled={busy || !entered || difference === 0}
            className="bg-ink font-display focus-visible:outline-primary min-h-[48px] cursor-pointer rounded-[12px] px-5 text-[15px] font-bold text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy ? common("saving") : t("correctSubmit")}
          </button>
        </div>
      </form>
    </dialog>
  );
}
