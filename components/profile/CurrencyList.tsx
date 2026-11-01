"use client";

import { useOptimistic, useTransition } from "react";
import { changeCurrency } from "@/app/actions/currency";
import { currencies, currencySymbols, type Currency } from "@/lib/i18n/config";
import { useFormat, useT } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

export function CurrencyList() {
  const t = useT("currency");
  const format = useFormat();
  const [shown, setShown] = useOptimistic(format.currency);
  const [, startTransition] = useTransition();

  const pick = (currency: Currency) => {
    if (currency === shown) return;
    startTransition(async () => {
      setShown(currency);
      await changeCurrency(currency);
    });
  };

  return (
    <div className="grid w-full max-w-[560px] gap-3.5">
      <p className="text-ink-soft text-[15px] leading-[1.55]">{t("hint")}</p>
      <section
        role="radiogroup"
        aria-label={t("hint")}
        className="bg-surface border-line-soft grid rounded-[20px] border px-[18px] shadow-[0_2px_4px_rgba(42,40,37,0.03)]"
      >
        {currencies.map((currency, index) => {
          const on = currency === shown;
          const symbol = currencySymbols[currency];

          return (
            <button
              key={currency}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => pick(currency)}
              className={cn(
                "focus-visible:outline-primary flex min-h-[58px] cursor-pointer items-center gap-3.5 py-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2",
                index > 0 && "border-t border-[#f4f0e7]",
              )}
            >
              <span
                className={cn(
                  "font-display flex h-10 w-10 flex-none items-center justify-center rounded-[12px] text-[16px] font-bold",
                  on ? "bg-panel text-primary-dark" : "bg-field-alt",
                )}
              >
                {symbol.trim()}
              </span>
              <span className="grid min-w-0 flex-1">
                <span className="text-[15px] font-semibold">
                  {t(currency)} ({currency})
                </span>
                <span className="text-ink-soft text-[13px]">
                  {symbol}
                  {format.number(45000)}
                </span>
              </span>
              <span
                className={cn(
                  "flex h-[22px] w-[22px] items-center justify-center rounded-full border-2",
                  on ? "border-primary" : "border-[#d8d2c4]",
                )}
              >
                {on && <span className="bg-primary h-2.5 w-2.5 rounded-full" />}
              </span>
            </button>
          );
        })}
      </section>
    </div>
  );
}
