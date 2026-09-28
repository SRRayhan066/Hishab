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
    <Card data-tour="savings" className="px-[22px] pt-[22px] pb-4">
      <h2 className="font-display text-[18px] font-bold">
        {t("savingsTitle")}
      </h2>

      {months.length === 0 ? (
        <p className="text-ink-faint pt-3.5 pb-3 text-[15px]">
          {t("savingsEmpty")}
        </p>
      ) : (
        <ul className="mt-1">
          {months.map((month) => (
            <li
              key={month.id}
              className="flex items-center gap-3 border-b-[1.5px] border-[#f4f0e7] py-3.5 last:border-b-0"
            >
              <span className="w-[84px] flex-none text-[16px] font-semibold">
                {format.month(month.month - 1)}
              </span>

              <div className="h-[10px] min-w-[40px] flex-1 rounded-full bg-[#f2eee5]">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${month.percent}%`,
                    background: toneInk[month.tone],
                  }}
                />
              </div>

              <span
                className="font-display w-[92px] flex-none text-right text-[16px] font-bold"
                style={{ color: toneInk[month.tone] }}
                aria-label={t("savingsAria", {
                  month: format.month(month.month - 1),
                  amount: format.taka(Math.abs(month.amount)),
                  word: t(month.amount >= 0 ? "savedWord" : "lostWord"),
                })}
              >
                {format.signedTaka(month.amount)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
