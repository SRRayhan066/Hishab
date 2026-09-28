import { Card } from "@/components/ui/Card";
import type { MonthSummary } from "@/lib/finance/types";
import { getFormat, getT } from "@/lib/i18n/server";

export async function BalanceCard({ summary }: { summary: MonthSummary }) {
  const [t, format] = await Promise.all([getT("home"), getFormat()]);
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
    ? t("short", { amount: format.taka(-freeToSpend) })
    : daysLeft > 0
      ? t("perDay", { amount: format.taka(perDay) })
      : t("lastDay");

  return (
    <Card className="px-6 pt-[26px] pb-7">
      <p className="text-ink-muted text-[15px] font-medium">
        {t("balanceLabel")}
      </p>
      <p className="font-display mt-1 text-[clamp(46px,11vw,74px)] leading-[1.05] font-bold tracking-[-0.02em]">
        {format.taka(balance)}
      </p>
      <p className="text-ink-soft mt-2 max-w-[38ch] text-[16px] leading-[1.55]">
        {sentence}
      </p>

      <dl className="mt-6 grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(170px,1fr))]">
        <div className="bg-field rounded-[16px] px-[18px] py-4">
          <dt className="text-ink-muted text-[14px]">
            {t("remainingPlanned")}
          </dt>
          <dd className="font-display mt-0.5 text-[22px] font-bold">
            {format.taka(remainingPlanned)}
          </dd>
        </div>

        <div
          className={`rounded-[16px] px-[18px] py-4 ${
            short ? "bg-danger-bg" : "bg-panel"
          }`}
        >
          <dt className="text-ink-soft text-[14px]">{t("freeToSpend")}</dt>
          <dd
            className={`font-display mt-0.5 text-[22px] font-bold ${
              short ? "text-danger-ink" : "text-primary-dark"
            }`}
          >
            {format.taka(freeToSpend)}
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
          <span>{t("spentSoFar", { amount: format.taka(spentTotal) })}</span>
          <span>{t("paceMarker")}</span>
          <span>{t("planned", { amount: format.taka(plannedTotal) })}</span>
        </div>
      </div>
    </Card>
  );
}
