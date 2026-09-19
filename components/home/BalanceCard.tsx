import { Card } from "@/components/ui/Card";
import { formatTaka } from "@/lib/finance/format";
import type { MonthSummary } from "@/lib/finance/types";

export function BalanceCard({ summary }: { summary: MonthSummary }) {
  const {
    balance,
    remainingPlanned,
    freeToSpend,
    perDay,
    daysLeft,
    spentTotal,
    plannedTotal,
    spentPercent,
    idealPercent,
    isUnderPlan,
  } = summary;

  const short = freeToSpend < 0;

  const sentence = short
    ? `পরিকল্পনার সব খরচ মেটাতে আরও ${formatTaka(-freeToSpend)} লাগবে। কোনো খাত কমাতে হবে।`
    : daysLeft > 0
      ? `ফিক্সড খরচগুলো সরিয়ে রাখলে দিনে প্রায় ${formatTaka(perDay)} করে খরচ করতে পারো।`
      : "আজই মাসের শেষ দিন।";

  return (
    <Card className="px-6 pt-[26px] pb-7">
      <p className="text-ink-muted text-[15px] font-medium">এখন হাতে আছে</p>
      <p className="font-display mt-1 text-[clamp(46px,11vw,74px)] leading-[1.05] font-bold tracking-[-0.02em]">
        {formatTaka(balance)}
      </p>
      <p className="text-ink-soft mt-2 max-w-[38ch] text-[16px] leading-[1.55]">
        {sentence}
      </p>

      <dl className="mt-6 grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(170px,1fr))]">
        <div className="bg-field rounded-[16px] px-[18px] py-4">
          <dt className="text-ink-muted text-[14px]">খরচ বাকি (পরিকল্পনা)</dt>
          <dd className="font-display mt-0.5 text-[22px] font-bold">
            {formatTaka(remainingPlanned)}
          </dd>
        </div>

        <div
          className={`rounded-[16px] px-[18px] py-4 ${
            short ? "bg-danger-bg" : "bg-panel"
          }`}
        >
          <dt className="text-ink-soft text-[14px]">বাড়তি টাকা (এই মাসের)</dt>
          <dd
            className={`font-display mt-0.5 text-[22px] font-bold ${
              short ? "text-danger-ink" : "text-primary-dark"
            }`}
          >
            {formatTaka(freeToSpend)}
          </dd>
        </div>
      </dl>

      <div className="mt-[26px]">
        <div className="relative h-[18px] rounded-full bg-[#f2eee5]">
          <div
            className="absolute top-0 bottom-0 left-0 rounded-full"
            style={{
              width: `${spentPercent}%`,
              background: isUnderPlan
                ? "var(--color-primary)"
                : "var(--color-danger)",
            }}
          />
          <div
            className="bg-ink absolute -top-[7px] -bottom-[7px] w-[3px] rounded-[2px]"
            style={{ left: `${idealPercent}%` }}
          />
        </div>
        <div className="text-ink-muted mt-2.5 flex justify-between gap-3 text-[14px]">
          <span>খরচ হয়েছে {formatTaka(spentTotal)}</span>
          <span>আজকের হিসাবে এখানে থাকার কথা</span>
          <span>পরিকল্পনা {formatTaka(plannedTotal)}</span>
        </div>
      </div>
    </Card>
  );
}
