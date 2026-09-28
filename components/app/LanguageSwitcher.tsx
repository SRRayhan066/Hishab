"use client";

import { useOptimistic, useTransition } from "react";
import { changeLocale } from "@/app/actions/locale";
import { useLocale, useT } from "@/lib/i18n/client";
import { localeShortNames, locales } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const locale = useLocale();
  const t = useT("language");
  const [shown, setShown] = useOptimistic(locale);
  const [busy, startTransition] = useTransition();
  const next = shown === "bn" ? "en" : "bn";
  const label = t(next === "en" ? "toEnglish" : "toBangla");

  const toggle = () => {
    startTransition(async () => {
      setShown(next);
      await changeLocale(next);
    });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-label={label}
      title={label}
      className="border-line-soft bg-surface hover:border-line focus-visible:outline-primary relative grid h-11 flex-none cursor-pointer grid-cols-2 items-center rounded-full border p-1 text-[13px] font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-wait"
    >
      <span
        aria-hidden
        className={cn(
          "bg-ink absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full transition-transform duration-200 ease-out motion-reduce:transition-none",
          shown === "en" && "translate-x-full",
        )}
      />
      {locales.map((option) => (
        <span
          key={option}
          aria-hidden
          lang={option}
          className={cn(
            "relative flex h-full min-w-10 items-center justify-center px-2.5 transition-colors duration-200",
            option === shown ? "text-white" : "text-ink-muted",
          )}
        >
          {localeShortNames[option]}
        </span>
      ))}
    </button>
  );
}
