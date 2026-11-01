import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { dayLabel } from "@/lib/finance/day-label";
import type { RecentEntry } from "@/lib/finance/entries";
import type { MonthSummary } from "@/lib/finance/types";
import { getFormat, getT } from "@/lib/i18n/server";

export async function RecentSpending({
  entries,
  summary,
}: {
  entries: RecentEntry[];
  summary: MonthSummary;
}) {
  const [t, common, format] = await Promise.all([
    getT("home"),
    getT("common"),
    getFormat(),
  ]);

  return (
    <Card className="grid gap-1 p-5 md:p-6">
      <div className="mb-1.5 flex items-baseline justify-between gap-2.5">
        <h2 className="font-display text-[19px] font-bold">{t("recentTitle")}</h2>
        <Link
          href="/spending"
          className="text-primary-dark focus-visible:outline-primary rounded-md py-1.5 text-[14px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          {t("seeAll")}
        </Link>
      </div>

      {entries.length === 0 ? (
        <p className="text-ink-soft border-t border-[#f4f0e7] pt-3 text-[15px]">
          {t("recentEmpty")}
        </p>
      ) : (
        <ul>
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="flex items-center justify-between gap-3 border-t border-[#f4f0e7] py-[11px]"
            >
              <span className="grid min-w-0">
                <span className="truncate text-[15px] font-semibold">
                  {entry.categoryName}
                </span>
                <span className="text-ink-soft text-[13px]">
                  {dayLabel(entry.day, summary.isPast ? null : summary.day, {
                    today: common("today"),
                    yesterday: common("yesterday"),
                    dayMonth: (day) =>
                      common("dayMonth", {
                        day: format.digits(day),
                        month: summary.monthName,
                      }),
                  })}
                  {entry.accountName && ` · ${entry.accountName}`}
                </span>
              </span>
              <span className="font-display text-[16px] font-bold whitespace-nowrap">
                {format.taka(entry.amount)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
