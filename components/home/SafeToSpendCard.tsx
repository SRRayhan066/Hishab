import { Card } from "@/components/ui/Card";
import { formatTaka } from "@/lib/finance/format";
import type { MonthSummary } from "@/lib/finance/types";

export function SafeToSpendCard({ summary }: { summary: MonthSummary }) {
  const {
    safeToSpend,
    perDay,
    daysLeft,
    delta,
    isUnderBudget,
    spentPercent,
    idealPercent,
    spentVariable,
    adjustedBudget,
  } = summary;

  const paceSentence =
    daysLeft > 0
      ? `দিনে প্রায় ${formatTaka(perDay)} করে চললে বাকি ${daysLeft} দিন ভালোভাবেই কেটে যাবে।`
      : "আজই মাসের শেষ দিন।";

  return (
    <Card className="px-6 pt-[26px] pb-7">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="min-w-0">
          <p className="text-ink-muted text-[15px] font-medium">
            এই মাসে আর খরচ করা যাবে
          </p>
          <p className="font-display mt-1 text-[clamp(46px,11vw,74px)] leading-[1.05] font-bold tracking-[-0.02em]">
            {formatTaka(safeToSpend)}
          </p>
          <p className="text-ink-soft mt-2 max-w-[36ch] text-[16px] leading-[1.55]">
            {paceSentence}
          </p>
        </div>

        <div
          className={`min-w-[210px] flex-[0_1_250px] rounded-[18px] px-5 py-[18px] ${
            isUnderBudget
              ? "bg-panel text-[#3d5f39]"
              : "bg-danger-bg text-danger-ink"
          }`}
        >
          <p className="text-[14px] font-semibold">মাসের হিসাবে তুমি</p>
          <p className="font-display mt-0.5 text-[29px] font-bold">
            {formatTaka(Math.abs(delta))}
          </p>
          <p className="mt-0.5 text-[15px] font-semibold">
            {isUnderBudget
              ? "কম খরচ করেছো, ভালো আছো"
              : "বেশি খরচ করে ফেলেছো"}
          </p>
        </div>
      </div>

      <div className="mt-[26px]">
        <div className="bg-[#f2eee5] relative h-[18px] rounded-full">
          <div
            className="absolute top-0 bottom-0 left-0 rounded-full"
            style={{
              width: `${spentPercent}%`,
              background: isUnderBudget ? "var(--color-primary)" : "var(--color-danger)",
            }}
          />
          <div
            className="bg-ink absolute -top-[7px] -bottom-[7px] w-[3px] rounded-[2px]"
            style={{ left: `${idealPercent}%` }}
          />
        </div>
        <div className="text-ink-muted mt-2.5 flex justify-between gap-3 text-[14px]">
          <span>খরচ {formatTaka(spentVariable)}</span>
          <span>আজ পর্যন্ত থাকা উচিত</span>
          <span>সীমা {formatTaka(adjustedBudget)}</span>
        </div>
      </div>
    </Card>
  );
}
