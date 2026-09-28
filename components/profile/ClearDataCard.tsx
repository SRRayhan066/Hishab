"use client";

import { useId, useState, useTransition } from "react";
import {
  ArrowLeftRight,
  CalendarRange,
  Check,
  ReceiptText,
  Trash2,
  TriangleAlert,
  WalletMinimal,
} from "lucide-react";
import { clearAllData } from "@/app/actions/profile";
import { Card } from "@/components/ui/Card";
import { FormError } from "@/components/ui/FormError";
import { useFormat, useT } from "@/lib/i18n/client";

export function ClearDataCard({ entries }: { entries: number }) {
  const t = useT("profile");
  const common = useT("common");
  const errorsT = useT("errors");
  const format = useFormat();
  const phrase = t("clearPhrase");
  const inputId = useId();
  const [confirming, setConfirming] = useState(false);
  const [typed, setTyped] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, startTransition] = useTransition();
  const ready = typed.trim() === phrase;

  const cancel = () => {
    setConfirming(false);
    setTyped("");
    setError("");
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!ready) return;

    setError("");
    startTransition(async () => {
      try {
        const result = await clearAllData({ phrase: typed });
        if (result.error) {
          setError(result.error);
          return;
        }
        cancel();
        setDone(true);
      } catch {
        setError(errorsT("requestFailed"));
      }
    });
  };

  const removed = [
    { icon: CalendarRange, label: t("removedBudgets") },
    {
      icon: ReceiptText,
      label:
        entries > 0
          ? t(entries === 1 ? "removedEntriesCountOne" : "removedEntriesCount", {
              count: format.number(entries),
            })
          : t("removedEntries"),
    },
    { icon: WalletMinimal, label: t("removedAccounts") },
    { icon: ArrowLeftRight, label: t("removedTransfers") },
  ];

  const kept = [
    t("keptIdentity"),
    t("keptLogin"),
    t("keptAccount", { name: common("defaultAccount") }),
  ];

  return (
    <Card className="px-[22px] pt-[22px] pb-6">
      <div className="flex items-start gap-3">
        <span className="bg-danger-bg text-danger flex h-10 w-10 flex-none items-center justify-center rounded-full">
          <Trash2 className="h-[18px] w-[18px]" />
        </span>
        <div>
          <h2 className="font-display text-[18px] font-bold">{t("clearTitle")}</h2>
          <p className="text-ink-muted mt-0.5 text-[14px] leading-[1.55]">
            {t("clearHint")}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3.5 sm:grid-cols-2">
        <div className="bg-field rounded-[16px] px-[18px] py-4">
          <p className="text-ink-muted text-[14px] font-medium">{t("removedLabel")}</p>
          <ul className="mt-2.5 flex flex-col gap-2">
            {removed.map(({ icon: Icon, label }) => (
              <li key={label} className="text-ink-soft flex items-center gap-2.5 text-[15px]">
                <Icon className="text-danger h-4 w-4 flex-none" />
                {label}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-panel rounded-[16px] px-[18px] py-4">
          <p className="text-ink-soft text-[14px] font-medium">{t("keptLabel")}</p>
          <ul className="mt-2.5 flex flex-col gap-2">
            {kept.map((label) => (
              <li key={label} className="text-ink-panel flex items-center gap-2.5 text-[15px]">
                <Check className="text-primary h-4 w-4 flex-none" />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {confirming ? (
        <form
          onSubmit={handleSubmit}
          className="bg-danger-bg border-danger-line animate-pop-in mt-5 rounded-[16px] border px-[18px] pt-4 pb-[18px]"
        >
          <p className="text-danger-ink flex items-center gap-2 text-[15px] font-semibold">
            <TriangleAlert className="h-4 w-4 flex-none" />
            {t("confirmQuestion")}
          </p>
          <label htmlFor={inputId} className="text-danger-ink mt-1.5 block text-[14px] leading-[1.55]">
            {t("confirmBefore")}
            <span className="font-bold">“{phrase}”</span>
            {t("confirmAfter")}
          </label>
          <input
            id={inputId}
            value={typed}
            onChange={(event) => {
              setTyped(event.target.value);
              setError("");
            }}
            autoComplete="off"
            autoFocus
            placeholder={phrase}
            className="bg-surface border-danger-field text-ink placeholder:text-ink-faint focus:border-danger rounded-field mt-3 min-h-[50px] w-full border-[1.5px] px-[15px] text-[16px] outline-none transition-colors"
          />
          {error && (
            <div className="mt-3">
              <FormError message={error} />
            </div>
          )}
          <div className="mt-3.5 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={cancel}
              disabled={busy}
              className="bg-surface border-line text-ink hover:border-line-strong focus-visible:outline-primary min-h-[48px] cursor-pointer rounded-[12px] border-[1.5px] px-5 text-[15px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {t("keep")}
            </button>
            <button
              type="submit"
              disabled={!ready || busy}
              className="bg-danger font-display focus-visible:outline-danger flex min-h-[48px] cursor-pointer items-center justify-center gap-2 rounded-[12px] px-5 text-[15px] font-bold text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Trash2 className="h-4 w-4" />
              {busy ? t("clearing") : t("clearConfirm")}
            </button>
          </div>
        </form>
      ) : (
        <>
          <button
            type="button"
            onClick={() => {
              setConfirming(true);
              setDone(false);
            }}
            className="border-danger-line text-danger hover:bg-danger-bg focus-visible:outline-danger mt-5 flex min-h-[50px] w-full cursor-pointer items-center justify-center gap-2 rounded-[12px] border-[1.5px] px-4 text-[16px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <Trash2 className="h-4 w-4" />
            {t("clearStart")}
          </button>
          {done && (
            <p aria-live="polite" className="text-primary-dark mt-3 text-center text-[14px] font-medium">
              {t("cleared")}
            </p>
          )}
        </>
      )}
    </Card>
  );
}
