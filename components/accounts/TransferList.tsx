"use client";

import { useMemo, useOptimistic, useState, useTransition } from "react";
import { removeTransfer } from "@/app/actions/accounts";
import { Card } from "@/components/ui/Card";
import { FormError } from "@/components/ui/FormError";
import { accountNames } from "@/lib/finance/accounts";
import { formatTaka } from "@/lib/finance/format";
import type { MoneyAccount, TransferEntry } from "@/lib/finance/types";

type TransferListProps = {
  accounts: MoneyAccount[];
  transfers: TransferEntry[];
  monthName: string;
};

export function TransferList({
  accounts,
  transfers,
  monthName,
}: TransferListProps) {
  const names = useMemo(() => accountNames(accounts), [accounts]);
  const sorted = useMemo(
    () =>
      [...transfers].sort((a, b) => b.day - a.day || b.addedAt - a.addedAt),
    [transfers],
  );
  const [visible, hide] = useOptimistic(sorted, (current, id: string) =>
    current.filter((transfer) => transfer.id !== id),
  );
  const [error, setError] = useState("");
  const [, startRemoval] = useTransition();

  const handleRemove = (id: string) => {
    setError("");
    startRemoval(async () => {
      hide(id);
      const result = await removeTransfer(id);
      if (result.error) setError(result.error);
    });
  };

  return (
    <Card className="px-[22px] pt-[22px] pb-4">
      <h2 className="font-display text-[18px] font-bold">এই মাসের ট্রান্সফার</h2>

      {error && (
        <div className="mt-3">
          <FormError message={error} />
        </div>
      )}

      {visible.length === 0 ? (
        <p className="text-ink-faint pt-3.5 pb-3 text-[15px]">
          এই মাসে এখনো কোনো ট্রান্সফার হয়নি।
        </p>
      ) : (
        <ul className="mt-1">
          {visible.map((transfer) => {
            const from = names.get(transfer.fromId) ?? "";
            const to = names.get(transfer.toId) ?? "";

            return (
              <li
                key={transfer.id}
                className="flex items-center gap-3 border-b-[1.5px] border-[#f4f0e7] py-2.5 last:border-b-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[16px] font-semibold">
                    {from} → {to}
                  </p>
                  <p className="text-ink-muted mt-px text-[14px]">
                    {transfer.day} {monthName}
                  </p>
                </div>
                <span className="text-ink-soft text-[16px] font-semibold">
                  {formatTaka(transfer.amount)}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemove(transfer.id)}
                  aria-label={`${from} থেকে ${to}-এ ${formatTaka(transfer.amount)} ট্রান্সফার মুছে ফেলো`}
                  className="text-line-strong hover:text-danger focus-visible:outline-primary -mr-2.5 flex h-11 w-11 flex-none cursor-pointer items-center justify-center rounded-[12px] text-[20px] leading-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  ×
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
