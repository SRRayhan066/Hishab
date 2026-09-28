import { Card } from "@/components/ui/Card";
import { useFormat, useT } from "@/lib/i18n/client";
import type {
  CategoryStat,
  MoneyAccount,
  MonthSummary,
} from "@/lib/finance/types";

type RunningTotalsProps = {
  summary: MonthSummary;
  todaySpent: number;
  category: CategoryStat | undefined;
  account?: MoneyAccount;
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
  account,
}: RunningTotalsProps) {
  const t = useT("add");
  const format = useFormat();

  return (
    <Card className="px-[22px] py-5">
      <dl className="grid gap-x-4 gap-y-3.5 [grid-template-columns:repeat(auto-fit,minmax(116px,1fr))]">
        <div>
          <dt className="text-ink-muted text-[14px] font-medium">
            {t("todaySpent")}
          </dt>
          <dd className="font-display mt-0.5 text-[21px] font-bold">
            {format.taka(todaySpent)}
          </dd>
        </div>

        <div>
          <dt className="text-ink-muted text-[14px] font-medium">
            {t("freeToSpend")}
          </dt>
          <dd
            className="font-display mt-0.5 text-[21px] font-bold"
            style={{
              color: summary.freeToSpend < 0 ? "var(--color-over)" : undefined,
            }}
          >
            {format.taka(summary.freeToSpend)}
          </dd>
        </div>

        {category && (
          <div>
            <dt className="text-ink-muted text-[14px] font-medium">
              {category.name}
            </dt>
            <dd
              className="font-display mt-0.5 text-[21px] font-bold"
              style={{ color: toneInk[category.tone] }}
            >
              {category.leftLabel}
            </dd>
          </div>
        )}

        {account && (
          <div>
            <dt className="text-ink-muted text-[14px] font-medium">
              {t("inAccount", { name: account.name })}
            </dt>
            <dd
              className="font-display mt-0.5 text-[21px] font-bold"
              style={{
                color: account.balance < 0 ? "var(--color-over)" : undefined,
              }}
            >
              {format.taka(account.balance)}
            </dd>
          </div>
        )}
      </dl>
    </Card>
  );
}
