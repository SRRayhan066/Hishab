"use client";

import { useState, useTransition } from "react";
import { addAccount } from "@/app/actions/accounts";
import { AmountInput } from "@/components/ui/AmountInput";
import { FormError } from "@/components/ui/FormError";
import { Sheet, SheetTitle } from "@/components/ui/Sheet";
import { colorOf, pickAccountStyle } from "@/lib/finance/account-style";
import type { MoneyAccount } from "@/lib/finance/types";
import { useFormat, useT } from "@/lib/i18n/client";
import { AccountIcon } from "./AccountCard";

export function AddAccountSheet({
  used,
  onClose,
}: {
  used: MoneyAccount[];
  onClose: () => void;
}) {
  const t = useT("accounts");
  const common = useT("common");
  const errorsT = useT("errors");
  const format = useFormat();
  const [style] = useState(() => pickAccountStyle(used));
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [busy, startTransition] = useTransition();
  const palette = colorOf(style.color);
  const trimmed = name.trim();

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!trimmed) return;

    setError("");
    startTransition(async () => {
      try {
        const result = await addAccount({ name: trimmed, amount, ...style });
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
    <Sheet label={t("addTitle")} maxWidth={420} onClose={onClose}>
      <form
        onSubmit={submit}
        noValidate
        className="grid grid-cols-[minmax(0,1fr)] gap-4"
      >
        <SheetTitle title={t("addTitle")} onClose={onClose} />

        <div
          className="relative isolate grid gap-1 overflow-hidden rounded-[18px] border px-4 py-3.5"
          style={{
            background: `linear-gradient(135deg, ${palette.from} 0%, ${palette.to} 100%)`,
            borderColor: palette.border,
            color: palette.ink,
          }}
        >
          <span
            aria-hidden
            className="absolute -top-20 -left-12 -z-10 h-48 w-48 rounded-full bg-white/55"
          />
          <AccountIcon
            icon={style.icon}
            className="absolute top-0.5 -right-4 -z-10 h-24 w-24 -rotate-12 opacity-[0.11]"
          />
          <span className="text-[13px] font-medium opacity-75">
            {trimmed || t("newAccount")}
          </span>
          <span className="font-display text-[24px] font-bold">
            {format.taka(Number(amount) || 0)}
          </span>
        </div>

        <label className="grid gap-1.5">
          <span className="text-ink-soft text-[14px] font-semibold">
            {t("accountName")}
          </span>
          <input
            value={name}
            autoFocus
            maxLength={60}
            onChange={(event) => setName(event.target.value)}
            placeholder={t("addPlaceholder")}
            className="bg-field border-line rounded-field text-ink placeholder:text-ink-muted focus:border-primary h-12 w-full border px-3.5 text-[16px] outline-none"
          />
        </label>

        <label className="grid gap-1.5">
          <span className="text-ink-soft text-[14px] font-semibold">
            {t("addBalance")}
          </span>
          <span className="bg-field border-line rounded-field focus-within:border-primary flex h-12 items-center gap-2 border px-3.5">
            <span className="font-display text-ink-muted text-[17px] font-bold">
              {format.symbol}
            </span>
            <AmountInput
              value={amount}
              placeholder="0"
              onChange={(event) => setAmount(event.target.value)}
              className="font-display text-ink w-0 min-w-0 flex-1 border-0 bg-transparent text-[18px] font-bold outline-none"
            />
          </span>
          <span className="text-ink-soft text-[13px]">{t("addHint")}</span>
        </label>

        <FormError message={error} />

        <button
          type="submit"
          disabled={!trimmed || busy}
          className="bg-ink font-display focus-visible:outline-primary h-[50px] cursor-pointer rounded-[14px] text-[16px] font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-45"
        >
          {busy ? common("saving") : t("addAccount")}
        </button>
      </form>
    </Sheet>
  );
}
