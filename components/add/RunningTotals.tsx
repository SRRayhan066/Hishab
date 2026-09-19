import { Card } from "@/components/ui/Card";
import { formatTaka } from "@/lib/finance/format";
import type { CategoryStat, MonthSummary } from "@/lib/finance/types";

type RunningTotalsProps = {
  summary: MonthSummary;
  todaySpent: number;
  category: CategoryStat | undefined;
};

const toneInk: Record<CategoryStat["tone"], string> = {
  good: "var(--color-primary)",
  warning: "#9a6d12",
  over: "var(--color-over)",
};

export function RunningTotals({
  summary,
  todaySpent,
  category,
}: RunningTotalsProps) {
  return (
    <Card className="px-[22px] py-5">
      <dl className="flex flex-wrap gap-x-8 gap-y-4">
        <div>
          <dt className="text-ink-muted text-[14px] font-medium">
            আজকের খরচ
          </dt>
          <dd className="font-display mt-0.5 text-[24px] font-bold">
            {formatTaka(todaySpent)}
          </dd>
        </div>

        <div>
          <dt className="text-ink-muted text-[14px] font-medium">
মুক্ত টাকা
          </dt>
          <dd
            className="font-display mt-0.5 text-[24px] font-bold"
            style={{
              color: summary.freeToSpend < 0 ? "var(--color-over)" : undefined,
            }}
          >
            {formatTaka(summary.freeToSpend)}
          </dd>
        </div>

        {category && (
          <div>
            <dt className="text-ink-muted text-[14px] font-medium">
              {category.name}
            </dt>
            <dd
              className="font-display mt-0.5 text-[24px] font-bold"
              style={{ color: toneInk[category.tone] }}
            >
              {category.leftLabel}
            </dd>
          </div>
        )}
      </dl>
    </Card>
  );
}
