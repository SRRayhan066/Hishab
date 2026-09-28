import { Card } from "@/components/ui/Card";
import { getFormat, getT } from "@/lib/i18n/server";
import type { MonthResult } from "@/lib/finance/history";

const toneInk: Record<MonthResult["tone"], string> = {
  good: "var(--color-primary)",
  over: "var(--color-over)",
};

export async function PastMonths({ months }: { months: MonthResult[] }) {
  const [t, format] = await Promise.all([getT("history"), getFormat()]);

  return (
    <Card data-tour="history" className="px-[22px] pt-6 pb-[26px]">
      <h2 className="font-display text-[19px] font-bold">{t("pastTitle")}</h2>
      <p className="text-ink-muted mt-[3px] text-[15px]">
        {t("pastHint")}
      </p>

      {months.length === 0 ? (
        <p className="text-ink-faint pt-4 text-[15px]">
          {t("pastEmpty")}
        </p>
      ) : (
        <ul className="mt-2">
          {months.map((month) => (
            <li
              key={month.id}
              className="flex items-center gap-3.5 border-b-[1.5px] border-[#f4f0e7] py-4 last:border-b-0"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[17px] font-semibold">
                  {format.month(month.month - 1)}
                </p>
                <p className="text-ink-muted mt-0.5 text-[14px]">
                  {t("spentAndLimit", {
                    spent: format.taka(month.spent),
                    budget: format.taka(month.budget),
                  })}
                </p>
              </div>

              <div className="flex-none text-right">
                <p
                  className="font-display text-[19px] font-bold"
                  style={{ color: toneInk[month.tone] }}
                >
                  {format.signedTaka(month.amount)}
                </p>
                <p className="text-ink-muted text-[14px]">
                  {t(month.tone === "good" ? "savedWord" : "overWord")}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
