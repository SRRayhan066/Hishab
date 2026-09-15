import { Card } from "@/components/ui/Card";
import { formatTaka } from "@/lib/finance/format";
import type { SavingsView } from "@/lib/finance/savings";

export function SavingsSummary({ view }: { view: SavingsView }) {
  const { total, opening, pastSavedLabel, thisMonth, sentence } = view;
  const gaining = thisMonth >= 0;

  return (
    <Card className="px-6 pt-[26px] pb-7">
      <p className="text-ink-muted text-[15px] font-medium">সব মিলিয়ে জমা</p>
      <p className="font-display mt-1 text-[clamp(46px,11vw,74px)] leading-[1.05] font-bold tracking-[-0.02em]">
        {formatTaka(total)}
      </p>
      <p className="text-ink-soft mt-2 max-w-[42ch] text-[16px] leading-[1.55]">
        {sentence}
      </p>

      <dl className="mt-6 grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(160px,1fr))]">
        <div className="bg-field rounded-[16px] px-[18px] py-4">
          <dt className="text-ink-muted text-[14px]">আগে থেকে ছিল</dt>
          <dd className="font-display mt-0.5 text-[22px] font-bold">
            {formatTaka(opening)}
          </dd>
        </div>

        <div className="bg-field rounded-[16px] px-[18px] py-4">
          <dt className="text-ink-muted text-[14px]">আগের মাসগুলো থেকে</dt>
          <dd className="font-display mt-0.5 text-[22px] font-bold">
            {pastSavedLabel}
          </dd>
        </div>

        <div
          className={`rounded-[16px] px-[18px] py-4 ${
            gaining ? "bg-panel" : "bg-danger-bg"
          }`}
        >
          <dt className="text-ink-soft text-[14px]">এই মাসে জমছে</dt>
          <dd
            className={`font-display mt-0.5 text-[22px] font-bold ${
              gaining ? "text-primary-dark" : "text-danger-ink"
            }`}
          >
            {formatTaka(thisMonth)}
          </dd>
        </div>
      </dl>
    </Card>
  );
}
