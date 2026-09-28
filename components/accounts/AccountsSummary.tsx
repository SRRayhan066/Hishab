import { Card } from "@/components/ui/Card";
import { useFormat, useT } from "@/lib/i18n/client";
import type { SavingsView } from "@/lib/finance/accounts";

export function AccountsSummary({ view }: { view: SavingsView }) {
  const t = useT("accounts");
  const format = useFormat();
  const { total, opening, pastSaved, thisMonth, projected } = view;
  const gaining = thisMonth >= 0;

  return (
    <Card className="px-6 pt-[26px] pb-7">
      <p className="text-ink-muted text-[15px] font-medium">
        {t("totalLabel")}
      </p>
      <p className="font-display mt-1 text-[clamp(46px,11vw,74px)] leading-[1.05] font-bold tracking-[-0.02em]">
        {format.taka(total)}
      </p>
      <p className="text-ink-soft mt-2 max-w-[42ch] text-[16px] leading-[1.55]">
        {projected >= 0
          ? t("sentenceGain", { amount: format.taka(projected) })
          : t("sentenceLoss", { amount: format.taka(-projected) })}
      </p>

      <dl className="mt-6 grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(160px,1fr))]">
        <div className="bg-field rounded-[16px] px-[18px] py-4">
          <dt className="text-ink-muted text-[14px]">{t("opening")}</dt>
          <dd className="font-display mt-0.5 text-[22px] font-bold">
            {format.taka(opening)}
          </dd>
        </div>

        <div className="bg-field rounded-[16px] px-[18px] py-4">
          <dt className="text-ink-muted text-[14px]">{t("pastMonths")}</dt>
          <dd className="font-display mt-0.5 text-[22px] font-bold">
            {format.signedTaka(pastSaved)}
          </dd>
        </div>

        <div
          className={`rounded-[16px] px-[18px] py-4 ${
            gaining ? "bg-panel" : "bg-danger-bg"
          }`}
        >
          <dt className="text-ink-soft text-[14px]">{t("thisMonth")}</dt>
          <dd
            className={`font-display mt-0.5 text-[22px] font-bold ${
              gaining ? "text-primary-dark" : "text-danger-ink"
            }`}
          >
            {format.taka(thisMonth)}
          </dd>
        </div>
      </dl>
    </Card>
  );
}
