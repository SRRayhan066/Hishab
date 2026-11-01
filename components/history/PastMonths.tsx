"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { viewMonth } from "@/app/actions/month";
import { Card } from "@/components/ui/Card";
import type { MonthResult } from "@/lib/finance/history";
import { periodKey } from "@/lib/finance/period";
import { useFormat, useT } from "@/lib/i18n/client";

export function PastMonths({ months }: { months: MonthResult[] }) {
  const t = useT("history");
  const format = useFormat();
  const router = useRouter();
  const [busy, startTransition] = useTransition();

  const open = (month: MonthResult) => {
    startTransition(async () => {
      await viewMonth(periodKey(month));
      router.push("/home");
    });
  };

  return (
    <Card className="grid grid-cols-[minmax(0,1fr)] p-5 md:p-6">
      <h2 className="font-display text-[19px] font-bold">{t("pastTitle")}</h2>
      <p className="text-ink-soft mb-2 text-[14px] leading-[1.55]">
        {t("pastHint")}
      </p>

      {months.length === 0 ? (
        <p className="text-ink-soft border-t border-[#f4f0e7] pt-3 text-[15px]">
          {t("pastEmpty")}
        </p>
      ) : (
        months.map((month) => {
          const good = month.tone === "good";
          const percent =
            month.budget > 0
              ? Math.min(100, (month.spent / month.budget) * 100)
              : 100;

          return (
            <button
              key={month.id}
              type="button"
              disabled={busy}
              onClick={() => open(month)}
              className="focus-visible:outline-primary grid cursor-pointer gap-2 border-t border-[#f4f0e7] py-3.5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-wait"
            >
              <span className="flex items-baseline justify-between gap-3">
                <span className="text-[16px] font-semibold">
                  {format.month(month.month - 1)} {format.digits(month.year)}
                </span>
                <span
                  className={`font-display text-[16px] font-bold ${
                    good ? "text-primary-dark" : "text-over"
                  }`}
                >
                  {t(good ? "savedResult" : "overResult", {
                    amount: good
                      ? format.signedTaka(month.amount)
                      : format.taka(-month.amount),
                  })}
                </span>
              </span>
              <span className="block h-2.5 rounded-full bg-[#f2eee5]">
                <span
                  className="block h-full rounded-full"
                  style={{
                    width: `${percent}%`,
                    background: good ? "var(--color-fixed)" : "var(--color-over)",
                  }}
                />
              </span>
              <span className="text-ink-soft text-[13px]">
                {t("spentAndLimit", {
                  spent: format.taka(month.spent),
                  budget: format.taka(month.budget),
                })}
              </span>
            </button>
          );
        })
      )}
    </Card>
  );
}
