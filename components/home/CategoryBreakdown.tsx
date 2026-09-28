import { Card } from "@/components/ui/Card";
import type { CategoryStat, MonthSummary } from "@/lib/finance/types";
import { getT } from "@/lib/i18n/server";

const barColor: Record<CategoryStat["tone"], string> = {
  good: "var(--color-fixed)",
  warning: "var(--color-warn)",
  over: "var(--color-over)",
};

const textColor: Record<CategoryStat["tone"], string> = {
  good: "var(--color-primary)",
  warning: "#9a6d12",
  over: "var(--color-over)",
};

export async function CategoryBreakdown({ summary }: { summary: MonthSummary }) {
  const t = await getT("home");

  return (
    <Card className="flex flex-col gap-1 px-[22px] pt-[22px] pb-6">
      <h2 className="font-display text-[19px] font-bold">
        {t("breakdownTitle")}
      </h2>
      <p className="text-ink-muted mb-2.5 text-[14px]">{t("breakdownHint")}</p>

      <ul className="flex flex-col gap-1">
        {summary.categories.map((category) => (
          <li
            key={category.id}
            className="flex flex-col gap-[9px] rounded-[14px] border-[1.5px] border-[#f4f0e7] px-[14px] py-[13px]"
          >
            <div className="flex items-baseline justify-between gap-2.5">
              <span className="text-[16px] font-semibold">{category.name}</span>
              <span
                className="text-[15px] font-semibold"
                style={{ color: textColor[category.tone] }}
              >
                {category.leftLabel}
              </span>
            </div>

            {/* A temporary category has no budget, so there is no pace to show. */}
            {!category.temporary && (
              <div className="relative h-[9px] rounded-full bg-[#f2eee5]">
                <div
                  className="absolute top-0 bottom-0 left-0 rounded-full"
                  style={{
                    width: `${category.percent}%`,
                    background: barColor[category.tone],
                  }}
                />
                <div
                  className="absolute -top-[3px] -bottom-[3px] w-[2px] rounded-[2px] bg-[#c6bfae]"
                  style={{ left: `${category.idealPercent}%` }}
                />
              </div>
            )}

            <p className="text-ink-muted text-[14px]">{category.detail}</p>
          </li>
        ))}
      </ul>
    </Card>
  );
}
