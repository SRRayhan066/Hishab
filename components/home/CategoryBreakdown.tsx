import Link from "next/link";
import { Card } from "@/components/ui/Card";
import type { CategoryStat, MonthSummary } from "@/lib/finance/types";
import { getT } from "@/lib/i18n/server";

const barColor: Record<CategoryStat["tone"], string> = {
  good: "var(--color-fixed)",
  warning: "var(--color-warn)",
  over: "var(--color-over)",
};

const textColor: Record<CategoryStat["tone"], string> = {
  good: "var(--color-primary-dark)",
  warning: "#9a6d12",
  over: "var(--color-over)",
};

export async function CategoryBreakdown({ summary }: { summary: MonthSummary }) {
  const t = await getT("home");

  return (
    <Card className="grid gap-1 p-5 md:p-6">
      <div className="mb-1.5 flex items-baseline justify-between gap-2.5">
        <h2 className="font-display text-[19px] font-bold">
          {t("breakdownTitle")}
        </h2>
        {!summary.isPast && (
          <Link
            href="/budget"
            className="text-primary-dark focus-visible:outline-primary rounded-md py-1.5 text-[14px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {t("editPlan")}
          </Link>
        )}
      </div>

      {summary.categories.length === 0 ? (
        <p className="text-ink-soft border-t border-[#f4f0e7] pt-3 text-[15px]">
          {t("breakdownEmpty")}
        </p>
      ) : (
        <ul>
          {summary.categories.map((category) => (
            <li
              key={category.id}
              className="grid gap-[7px] border-t border-[#f4f0e7] py-3"
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="min-w-0 text-[15px] font-semibold">
                  {category.name}
                </span>
                <span
                  className="font-display text-[15px] font-bold whitespace-nowrap"
                  style={{
                    color: category.temporary
                      ? "var(--color-ink-soft)"
                      : textColor[category.tone],
                  }}
                >
                  {category.leftLabel}
                </span>
              </div>

              {!category.temporary && (
                <div className="relative h-2 rounded-full bg-[#f2eee5]">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{
                      width: `${category.percent}%`,
                      background: barColor[category.tone],
                    }}
                  />
                  {!summary.isPast && (
                    <div
                      className="absolute -top-[3px] -bottom-[3px] w-[2px] rounded-[2px] bg-[#c6bfae]"
                      style={{ left: `${category.idealPercent}%` }}
                    />
                  )}
                </div>
              )}

              <span className="text-ink-soft text-[13px]">{category.detail}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
