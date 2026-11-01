"use client";

import { useState, useTransition } from "react";
import { clearAllData } from "@/app/actions/profile";
import { Card } from "@/components/ui/Card";
import { FormError } from "@/components/ui/FormError";
import { useT } from "@/lib/i18n/client";

export function ClearDataForm() {
  const t = useT("profile");
  const common = useT("common");
  const errorsT = useT("errors");
  const phrase = t("clearPhrase");
  const [typed, setTyped] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, startTransition] = useTransition();
  const ready = typed.trim() === phrase;

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
        setTyped("");
        setDone(true);
      } catch {
        setError(errorsT("requestFailed"));
      }
    });
  };

  return (
    <div className="grid w-full max-w-[640px] gap-4">
      <div className="grid gap-3 md:grid-cols-2">
        <section className="bg-danger-bg border-danger-line text-danger-ink grid content-start gap-2 rounded-[18px] border px-[18px] py-4">
          <strong className="text-[15px]">{t("deletedTitle")}</strong>
          <span className="text-[14px] leading-[1.6]">{t("deletedBody")}</span>
        </section>
        <section className="bg-surface border-line-soft grid content-start gap-2 rounded-[18px] border px-[18px] py-4">
          <strong className="text-[15px]">{t("stayTitle")}</strong>
          <span className="text-ink-soft text-[14px] leading-[1.6]">
            {t("stayBody", { name: common("defaultAccount") })}
          </span>
        </section>
      </div>

      <Card className="p-5 md:p-6">
        <form onSubmit={handleSubmit} className="grid gap-3">
          <label className="grid gap-1.5">
            <span className="text-ink-soft text-[14px] font-semibold">
              {t("typeToConfirm", { phrase })}
            </span>
            <input
              value={typed}
              onChange={(event) => {
                setTyped(event.target.value);
                setError("");
                setDone(false);
              }}
              autoComplete="off"
              placeholder={phrase}
              className="bg-field border-line rounded-field text-ink placeholder:text-ink-muted focus:border-danger h-[50px] w-full border px-3.5 text-[16px] outline-none"
            />
          </label>
          <FormError message={error} />
          <button
            type="submit"
            disabled={!ready || busy}
            className="bg-danger font-display focus-visible:outline-danger h-[50px] cursor-pointer rounded-[14px] text-[16px] font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {busy ? t("clearing") : t("clearConfirm")}
          </button>
          {done && (
            <p aria-live="polite" className="text-primary-dark text-center text-[14px] font-medium">
              {t("cleared")}
            </p>
          )}
        </form>
      </Card>
    </div>
  );
}
