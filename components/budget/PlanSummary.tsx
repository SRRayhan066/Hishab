import { Card } from "@/components/ui/Card";
import { formatTaka } from "@/lib/finance/format";
import type { BudgetPlan } from "@/lib/finance/budget";

type PlanSummaryProps = {
  plan: BudgetPlan;
  monthName: string;
};

export function PlanSummary({ plan, monthName }: PlanSummaryProps) {
  const {
    fixedTotal,
    variableBudget,
    planned,
    isBalanced,
    perDay,
    splitFixed,
    splitVariable,
    splitSavings,
    note,
  } = plan;

  return (
    <Card className="px-[22px] pt-6 pb-[26px]">
      <h2 className="font-display text-[19px] font-bold">
        {monthName} মাসের শুরুতে হিসাব
      </h2>
      <p className="text-ink-muted mt-[3px] text-[15px] leading-[1.55]">
        মাসে কত আসছে, কোথায় বাঁধা খরচ, আর হাতে রাখা টাকা কোন খাতে কত — একবার
        বসিয়ে দাও।
      </p>

      <div
        role="img"
        aria-label={`আয়ের ভাগ — বাঁধা খরচ ${formatTaka(fixedTotal)}, হাতখরচ ${formatTaka(variableBudget)}, জমবে ${formatTaka(Math.max(planned, 0))}`}
        className="mt-5 flex h-[22px] gap-[2px] overflow-hidden rounded-full bg-[#f2eee5]"
      >
        <span
          className="block"
          style={{
            width: `${splitFixed}%`,
            background: "var(--color-fixed)",
          }}
        />
        <span
          className="block"
          style={{
            width: `${splitVariable}%`,
            background: "var(--color-warn)",
          }}
        />
        <span
          className="block"
          style={{
            width: `${splitSavings}%`,
            background: "var(--color-savings)",
          }}
        />
      </div>

      <dl className="mt-[18px] grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
        <div>
          <dt className="flex items-center gap-2">
            <span
              className="h-[11px] w-[11px] flex-none rounded-[4px]"
              style={{ background: "var(--color-fixed)" }}
            />
            <span className="text-ink-muted text-[14px]">বাঁধা খরচ</span>
          </dt>
          <dd className="font-display mt-0.5 text-[21px] font-bold">
            {formatTaka(fixedTotal)}
          </dd>
        </div>

        <div>
          <dt className="flex items-center gap-2">
            <span
              className="h-[11px] w-[11px] flex-none rounded-[4px]"
              style={{ background: "var(--color-warn)" }}
            />
            <span className="text-ink-muted text-[14px]">হাতখরচ</span>
          </dt>
          <dd className="font-display mt-0.5 text-[21px] font-bold">
            {formatTaka(variableBudget)}
          </dd>
          <p className="text-ink-faint mt-px text-[13px]">
            দিনে প্রায় {formatTaka(perDay)}
          </p>
        </div>

        <div>
          <dt className="flex items-center gap-2">
            <span
              className="h-[11px] w-[11px] flex-none rounded-[4px]"
              style={{ background: "var(--color-savings)" }}
            />
            <span className="text-ink-muted text-[14px]">মাস শেষে জমবে</span>
          </dt>
          <dd
            className={`font-display mt-0.5 text-[21px] font-bold ${
              isBalanced ? "text-primary" : "text-over"
            }`}
          >
            {formatTaka(planned)}
          </dd>
        </div>
      </dl>

      <p
        className={`mt-4 rounded-[14px] px-4 py-3.5 text-[15px] leading-[1.55] ${
          isBalanced
            ? "bg-panel text-primary-dark"
            : "bg-danger-bg text-danger-ink"
        }`}
      >
        {note}
      </p>
    </Card>
  );
}
