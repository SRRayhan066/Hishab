"use client";

import { useMemo, useOptimistic, useState, useTransition } from "react";
import { ArrowLeftRight, ChevronRight, X } from "lucide-react";
import { removeTransfer } from "@/app/actions/accounts";
import { useEntrySheet } from "@/components/entry/EntrySheetProvider";
import { Card } from "@/components/ui/Card";
import { FormError } from "@/components/ui/FormError";
import { accountNames, overdrawnAccount } from "@/lib/finance/accounts";
import type { MoneyAccount, TransferEntry } from "@/lib/finance/types";
import { useFormat, useT } from "@/lib/i18n/client";

type TransferPanelProps = {
  accounts: MoneyAccount[];
  transfers: TransferEntry[];
  monthName: string;
  readOnly: boolean;
};

export function TransferPanel({
  accounts,
  transfers,
  monthName,
  readOnly,
}: TransferPanelProps) {
  const t = useT("accounts");
  const common = useT("common");
  const errorsT = useT("errors");
  const format = useFormat();
  const { open } = useEntrySheet();
  const names = useMemo(() => accountNames(accounts), [accounts]);
  const sorted = useMemo(
    () => [...transfers].sort((a, b) => b.day - a.day || b.addedAt - a.addedAt),
    [transfers],
  );
  const [visible, hide] = useOptimistic(sorted, (current, id: string) =>
    current.filter((transfer) => transfer.id !== id),
  );
  const [error, setError] = useState("");
  const [, startRemoval] = useTransition();

  const handleRemove = (transfer: TransferEntry) => {
    const target = overdrawnAccount(
      accounts,
      new Map([[transfer.toId, -transfer.amount]]),
    );
    if (target) {
      setError(errorsT("balanceBelowZero", { name: target.name }));
      return;
    }

    setError("");
    startRemoval(async () => {
      hide(transfer.id);
      const result = await removeTransfer(transfer.id);
      if (result.error) setError(result.error);
    });
  };

  return (
    <Card className="grid grid-cols-[minmax(0,1fr)] px-5 py-1.5">
      {!readOnly && (
        <button
          type="button"
          onClick={() => open({ type: "transfer" })}
          className="focus-visible:outline-primary flex cursor-pointer items-center gap-3.5 border-b border-[#f4f0e7] py-3.5 text-left focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <span className="bg-field-alt flex h-[42px] w-[42px] flex-none items-center justify-center rounded-[12px]">
            <ArrowLeftRight className="h-5 w-5" />
          </span>
          <span className="grid min-w-0 flex-1">
            <span className="text-[15px] font-semibold">{t("transferTitle")}</span>
            <span className="text-ink-soft text-[13px]">{t("transferHint")}</span>
          </span>
          <ChevronRight className="text-ink-soft h-[22px] w-[22px] flex-none" />
        </button>
      )}

      <div className="grid py-2">
        <span className="text-ink-soft pt-1.5 pb-0.5 text-[13px] font-semibold">
          {readOnly
            ? t("transfersTitlePast", { month: monthName })
            : t("transfersTitle")}
        </span>

        <FormError message={error} />

        {visible.length === 0 ? (
          <p className="text-ink-soft py-2 text-[15px]">
            {readOnly
              ? t("transfersEmptyPast", { month: monthName })
              : t("transfersEmpty")}
          </p>
        ) : (
          <ul>
            {visible.map((transfer) => {
              const from = names.get(transfer.fromId) ?? "";
              const to = names.get(transfer.toId) ?? "";
              const amount = format.taka(transfer.amount);

              return (
                <li
                  key={transfer.id}
                  className="flex items-center justify-between gap-3 py-[9px]"
                >
                  <span className="grid min-w-0">
                    <span className="truncate text-[15px] font-semibold">
                      {from} → {to}
                    </span>
                    <span className="text-ink-soft text-[13px]">
                      {common("dayMonth", {
                        day: format.digits(transfer.day),
                        month: monthName,
                      })}
                    </span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="font-display text-[16px] font-bold">
                      {amount}
                    </span>
                    {!readOnly && (
                      <button
                        type="button"
                        onClick={() => handleRemove(transfer)}
                        aria-label={t("removeTransfer", { from, to, amount })}
                        className="text-ink-muted hover:text-danger focus-visible:outline-primary -mr-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-[10px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
                      >
                        <X className="h-[18px] w-[18px]" />
                      </button>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Card>
  );
}
