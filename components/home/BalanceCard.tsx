import { Card } from "@/components/ui/Card";
import type { MonthSummary } from "@/lib/finance/types";
import { getFormat, getT } from "@/lib/i18n/server";

export async function BalanceCard({ summary }: { summary: MonthSummary }) {
  const [t, format] = await Promise.all([getT("home"), getFormat()]);
  const {
    isPast,
    monthName,
    incomeTotal,
    netTotal,
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

  const pastTiles = [
    { label: t("pastIncome"), value: format.taka(incomeTotal) },
    { label: t("pastSpent"), value: format.taka(spentTotal) },
    { label: t("pastNet"), value: format.signedTaka(netTotal) },
  ];

  const perDayValues = {
    amount: format.taka(perDay),
    days: format.number(daysLeft),
  };

  const sentence = isPast
    ? t(netTotal >= 0 ? "pastSaved" : "pastLost", {
        amount: format.taka(Math.abs(netTotal)),
        month: monthName,
      })
    : short
      ? t("short", { amount: format.taka(-freeToSpend) })
      : daysLeft > 1
        ? t("perDay", perDayValues)
        : daysLeft === 1
          ? t("perDayOne", perDayValues)
          : t("lastDay");

  return (
    <Card className="grid gap-[18px] p-5 md:p-6">
      <div className="grid gap-1.5">
        <p className="text-ink-soft text-[15px] font-medium">
          {isPast
            ? t("balanceLabelPast", { month: monthName })
            : t("balanceLabel")}
        </p>
        <p className="font-display text-[50px] leading-[1.05] font-bold tracking-[-0.02em] md:text-[64px]">
          {format.taka(balance)}
        </p>
        <p className="text-ink-soft mt-1 text-[16px] leading-[1.55] text-pretty">
          {sentence}
        </p>
      </div>

      <dl className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(140px,1fr))]">
        {isPast ? (
          pastTiles.map((tile) => (
            <div key={tile.label} className="bg-field grid gap-1 rounded-[16px] px-4 py-3.5">
              <dt className="text-ink-soft text-[14px]">{tile.label}</dt>
              <dd className="font-display text-[22px] font-bold">{tile.value}</dd>
            </div>
          ))
        ) : (
          <>
            <div className="bg-field grid gap-1 rounded-[16px] px-4 py-3.5">
              <dt className="text-ink-soft text-[14px]">
                {t("remainingPlanned")}
              </dt>
              <dd className="font-display text-[22px] font-bold">
                {format.taka(remainingPlanned)}
              </dd>
            </div>
            <div
              className={`grid gap-1 rounded-[16px] px-4 py-3.5 ${
                short ? "bg-danger-bg" : "bg-panel"
              }`}
            >
              <dt className={`text-[14px] ${short ? "text-danger-ink" : "text-ink-panel"}`}>
                {t("freeToSpend")}
              </dt>
              <dd
                className={`font-display text-[22px] font-bold ${
                  short ? "text-danger-ink" : "text-primary-dark"
                }`}
              >
                {format.taka(freeToSpend)}
              </dd>
            </div>
          </>
        )}
      </dl>

      <div className="grid gap-2">
        <div className="relative h-3.5 rounded-full bg-[#f2eee5]">
          <div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              width: `${spentPercent}%`,
              background: isUnderPlan
                ? "var(--color-primary)"
                : "var(--color-danger)",
            }}
          />
          {!isPast && (
            <div
              className="bg-ink absolute -top-1 -bottom-1 w-[3px] rounded-[2px]"
              style={{ left: `${idealPercent}%` }}
            />
          )}
        </div>
        <div className="text-ink-soft flex flex-wrap justify-between gap-2.5 text-[13px]">
          <span>
            {t("meter", {
              spent: format.taka(spentTotal),
              planned: format.taka(plannedTotal),
            })}
          </span>
          {!isPast && <span>{t("paceMarker")}</span>}
        </div>
      </div>
    </Card>
  );
}
