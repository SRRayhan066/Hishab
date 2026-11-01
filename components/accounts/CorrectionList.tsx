"use client";

import { useMemo, useOptimistic, useState, useTransition } from "react";
import { removeCorrection } from "@/app/actions/accounts";
import { Card } from "@/components/ui/Card";
import { FormError } from "@/components/ui/FormError";
import { accountNames, overdrawnAccount } from "@/lib/finance/accounts";
import { useFormat, useT } from "@/lib/i18n/client";
import type {
  BalanceAdjustmentEntry,
  MoneyAccount,
} from "@/lib/finance/types";

type CorrectionListProps = {
  accounts: MoneyAccount[];
  adjustments: BalanceAdjustmentEntry[];
  monthName: string;
};

export function CorrectionList({
  accounts,
  adjustments,
  monthName,
}: CorrectionListProps) {
  const t = useT("accounts");
  const common = useT("common");
  const errorsT = useT("errors");
  const format = useFormat();
  const names = useMemo(() => accountNames(accounts), [accounts]);
  const sorted = useMemo(
    () =>
      [...adjustments].sort((a, b) => b.day - a.day || b.addedAt - a.addedAt),
    [adjustments],
  );
  const [visible, hide] = useOptimistic(sorted, (current, id: string) =>
    current.filter((adjustment) => adjustment.id !== id),
  );
  const [error, setError] = useState("");
  const [, startRemoval] = useTransition();

  const handleRemove = (id: string) => {
    const adjustment = adjustments.find((item) => item.id === id);
    const target = overdrawnAccount(
      accounts,
      new Map(adjustment ? [[adjustment.accountId, -adjustment.amount]] : []),
    );
    if (target) {
      setError(errorsT("balanceBelowZero", { name: target.name }));
      return;
    }

    setError("");
    startRemoval(async () => {
      hide(id);
      const result = await removeCorrection(id);
      if (result.error) setError(result.error);
    });
  };

  if (visible.length === 0 && !error) return null;

  return (
    <Card className="px-[22px] pt-[22px] pb-4">
      <h2 className="font-display text-[18px] font-bold">{t("correctionsTitle")}</h2>
      <p className="text-ink-muted mt-0.5 text-[14px] leading-[1.55]">
        {t("correctionsHint")}
      </p>

      {error && (
        <div className="mt-3">
          <FormError message={error} />
        </div>
      )}

      <ul className="mt-1">
        {visible.map((adjustment) => {
          const name = names.get(adjustment.accountId) ?? "";
          const amount = format.signedTaka(adjustment.amount);

          return (
            <li
              key={adjustment.id}
              className="flex items-center gap-3 border-b-[1.5px] border-[#f4f0e7] py-2.5 last:border-b-0"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[16px] font-semibold">{name}</p>
                <p className="text-ink-muted mt-px text-[14px]">
                  {common("dayMonth", {
                    day: format.digits(adjustment.day),
                    month: monthName,
                  })}
                </p>
              </div>
              <span className="text-ink-soft text-[16px] font-semibold">
                {amount}
              </span>
              <button
                type="button"
                onClick={() => handleRemove(adjustment.id)}
                aria-label={t("removeCorrection", { name, amount })}
                className="text-line-strong hover:text-danger focus-visible:outline-primary -mr-2.5 flex h-11 w-11 flex-none cursor-pointer items-center justify-center rounded-[12px] text-[20px] leading-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                ×
              </button>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
