import { Card } from "@/components/ui/Card";
import type { MonthSummary } from "@/lib/finance/types";
import { getT } from "@/lib/i18n/server";
import { BurndownChart } from "./BurndownChart";

export async function BurndownCard({ summary }: { summary: MonthSummary }) {
  const t = await getT("home");
  const lineColor = summary.isUnderPlan
    ? "var(--color-primary)"
    : "var(--color-danger)";

  return (
    <Card className="grid gap-3.5 p-5 md:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2.5">
        <h2 className="font-display text-[19px] font-bold">
          {t("burndownTitle")}
        </h2>
        <div className="text-ink-soft flex gap-3.5 text-[13px]">
          <span className="flex items-center gap-1.5">
            <span className="w-4 border-t-2 border-dashed border-[#b8b1a1]" />
            {t("legendPlan")}
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="h-[3px] w-4 rounded-[2px]"
              style={{ background: lineColor }}
            />
            {t("legendSpend")}
          </span>
        </div>
      </div>

      <BurndownChart
        burndown={summary.burndown}
        isUnderPlan={summary.isUnderPlan}
        monthName={summary.monthName}
      />
    </Card>
  );
}
