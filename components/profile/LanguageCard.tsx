"use client";

import { useOptimistic, useTransition } from "react";
import { changeLocale } from "@/app/actions/locale";
import { Card } from "@/components/ui/Card";
import { useLocale, useT } from "@/lib/i18n/client";
import { localeNames, locales, type Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

export function LanguageCard() {
  const locale = useLocale();
  const t = useT("language");
  const [shown, setShown] = useOptimistic(locale);
  const [busy, startTransition] = useTransition();

  const choose = (next: Locale) => {
    if (next === shown) return;
    startTransition(async () => {
      setShown(next);
      await changeLocale(next);
    });
  };

  return (
    <Card className="flex flex-col gap-4 px-[22px] pt-[22px] pb-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="font-display text-[18px] font-bold">{t("title")}</h2>
        <p className="text-ink-muted mt-0.5 text-[14px] leading-[1.55]">
          {t("description")}
        </p>
      </div>

      <fieldset
        disabled={busy}
        className="bg-field-alt rounded-tabs flex gap-[5px] p-[5px] sm:w-[260px] sm:flex-none"
      >
        <legend className="sr-only">{t("label")}</legend>
        {locales.map((option) => {
          const active = option === shown;

          return (
            <label
              key={option}
              lang={option}
              className={cn(
                "rounded-tab has-[:focus-visible]:outline-primary flex min-h-[46px] flex-1 cursor-pointer items-center justify-center px-3 text-[15px] font-bold transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:disabled]:cursor-wait",
                active
                  ? "bg-surface text-ink shadow-[0_1px_3px_rgba(42,40,37,0.09)]"
                  : "text-ink-muted hover:text-ink",
              )}
            >
              <input
                type="radio"
                name="locale"
                value={option}
                checked={active}
                onChange={() => choose(option)}
                className="sr-only"
              />
              {localeNames[option]}
            </label>
          );
        })}
      </fieldset>
    </Card>
  );
}
