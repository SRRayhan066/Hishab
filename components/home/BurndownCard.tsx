import { Card } from "@/components/ui/Card";
import type { MonthSummary } from "@/lib/finance/types";
import { BurndownChart } from "./BurndownChart";

export function BurndownCard({ summary }: { summary: MonthSummary }) {
  const lineColor = summary.isUnderPlan
    ? "var(--color-primary)"
    : "var(--color-danger)";

  return (
    <Card className="px-5 pt-6 pb-4">
      <div className="flex flex-wrap items-baseline justify-between gap-4 px-1 pb-1">
        <div>
          <h2 className="font-display text-[19px] font-bold">
            মাসটা কেমন যাচ্ছে
          </h2>
          <p className="text-ink-muted mt-0.5 text-[14px]">
            নিচের দিকে নামা মানে টাকা কমে আসছে।
          </p>
        </div>
        <div className="text-ink-soft flex gap-4 text-[14px] font-medium">
          <span className="flex items-center gap-[7px]">
            <span className="inline-block w-4 border-t-2 border-dashed border-[#b8b1a1]" />
            পরিকল্পনা
          </span>
          <span className="flex items-center gap-[7px]">
            <span
              className="inline-block h-1 w-4 rounded-[2px]"
              style={{ background: lineColor }}
            />
            তোমার খরচ
          </span>
        </div>
      </div>

      <BurndownChart
        burndown={summary.burndown}
        isUnderPlan={summary.isUnderPlan}
        monthName={summary.monthName}
      />

      <div className="h-[30px]" />
    </Card>
  );
}
