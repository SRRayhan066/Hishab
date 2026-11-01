import { Card } from "@/components/ui/Card";
import { useFormat, useT } from "@/lib/i18n/client";
import type { MonthResult } from "@/lib/finance/history";

const toneInk: Record<MonthResult["tone"], string> = {
  good: "var(--color-primary)",
  over: "var(--color-over)",
};

export function SavingsHistory({ months }: { months: MonthResult[] }) {
  const t = useT("accounts");
  const format = useFormat();

  return (
    <Card className="grid gap-3 p-5 md:p-6">
      <h2 className="font-display text-[19px] font-bold">{t("savingsTitle")}</h2>

      {months.length === 0 ? (
        <p className="text-ink-soft text-[15px]">{t("savingsEmpty")}</p>
      ) : (
        <ul className="grid gap-3">
          {months.map((month) => (
            <li
              key={month.id}
              className="grid grid-cols-[84px_minmax(0,1fr)_auto] items-center gap-3"
            >
              <span className="text-ink-soft truncate text-[14px]">
                {format.month(month.month - 1)}
              </span>
              <div className="h-2.5 rounded-full bg-[#f2eee5]">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${month.percent}%`,
                    background: toneInk[month.tone],
                  }}
                />
              </div>
              <span
                className="font-display min-w-16 text-right text-[15px] font-bold"
                style={{ color: month.tone === "over" ? toneInk.over : undefined }}
                aria-label={t("savingsAria", {
                  month: format.month(month.month - 1),
                  amount: format.taka(Math.abs(month.amount)),
                  word: t(month.amount >= 0 ? "savedWord" : "lostWord"),
                })}
              >
                {month.amount < 0
                  ? format.signedTaka(month.amount)
                  : format.taka(month.amount)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
