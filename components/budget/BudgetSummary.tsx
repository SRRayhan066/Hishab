import { CircleAlert, CircleCheck, CloudCheck, PencilLine } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useFormat, useT } from "@/lib/i18n/client";
import type { BudgetPlan } from "@/lib/finance/budget";
import { cn } from "@/lib/utils";

type BudgetSummaryProps = {
  plan: BudgetPlan;
  status?: "clean" | "dirty" | "saving";
};

export function BudgetSummary({ plan, status }: BudgetSummaryProps) {
  const t = useT("budget");
  const format = useFormat();
  const { incomeTotal, plannedTotal, leftOver, isBalanced, splitPlanned } = plan;
  const planColor = isBalanced ? "var(--color-warn)" : "var(--color-over)";
  const VerdictIcon = isBalanced ? CircleCheck : CircleAlert;
  const StatusIcon = status === "clean" ? CloudCheck : PencilLine;

  const stats = [
    {
      label: t("incomeStat"),
      value: format.taka(incomeTotal),
      dot: "var(--color-primary)",
      color: "var(--color-primary-dark)",
    },
    {
      label: t("budgetStat"),
      value: format.taka(plannedTotal),
      dot: planColor,
    },
    {
      label: t("leftOverStat"),
      value: format.taka(leftOver),
      dot: "var(--color-savings)",
      color: isBalanced ? undefined : "var(--color-over)",
    },
  ];

  return (
    <Card className="grid gap-4 p-5 md:p-6">
      <div
        role="img"
        aria-label={t("splitLabel", {
          planned: format.taka(plannedTotal),
          left: format.taka(Math.max(leftOver, 0)),
        })}
        className="bg-savings flex h-[22px] gap-[2px] overflow-hidden rounded-full"
      >
        <span
          className="block"
          style={{ width: `${splitPlanned}%`, background: planColor }}
        />
      </div>

      <dl className="grid grid-cols-3 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="grid min-w-0 gap-0.5">
            <dt className="text-ink-soft flex items-center gap-1.5 text-[13px] whitespace-nowrap">
              <span
                className="h-2 w-2 flex-none rounded-full"
                style={{ background: stat.dot }}
              />
              {stat.label}
            </dt>
            <dd
              className="font-display text-[18px] font-bold whitespace-nowrap md:text-[21px]"
              style={{ color: stat.color }}
            >
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>

      {status && (
        <>
          <p
            className={cn(
              "flex items-center gap-2 rounded-[13px] px-3.5 py-2.5 text-[15px] font-medium",
              isBalanced
                ? "bg-panel text-primary-dark"
                : "bg-danger-bg text-danger-ink",
            )}
          >
            <VerdictIcon className="h-5 w-5 flex-none" />
            {isBalanced
              ? t("verdictOk", { amount: format.taka(leftOver) })
              : t("verdictOver", { amount: format.taka(-leftOver) })}
          </p>
          <span
            aria-live="polite"
            className="text-ink-soft flex items-center gap-1.5 text-[13px]"
          >
            <StatusIcon className="h-[17px] w-[17px]" />
            {status === "saving"
              ? t("statusSaving")
              : status === "dirty"
                ? t("statusDirty")
                : t("statusClean")}
          </span>
        </>
      )}
    </Card>
  );
}
