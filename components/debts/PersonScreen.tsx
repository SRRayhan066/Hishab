"use client";

import { useOptimistic, useState, useTransition } from "react";
import { X } from "lucide-react";
import { removeDebtEntry } from "@/app/actions/debts";
import { useEntrySheet } from "@/components/entry/EntrySheetProvider";
import { Card } from "@/components/ui/Card";
import { FormError } from "@/components/ui/FormError";
import {
  isMoneyOut,
  type DebtEntryRow,
  type DebtKind,
  type DebtPersonView,
} from "@/lib/finance/debts";
import { samePeriod, type Period } from "@/lib/finance/period";
import { useFormat, useT } from "@/lib/i18n/client";
import { DirectionIcon, PersonBadge } from "./PersonBadge";
import { useDebtDate } from "./useDebtDate";

const kindLabels = {
  lend: "kindLend",
  borrow: "kindBorrow",
  gotBack: "kindGotBack",
  paidBack: "kindPaidBack",
} as const;

type PersonScreenProps = {
  person: DebtPersonView;
  current: Period;
};

export function PersonScreen({ person, current }: PersonScreenProps) {
  const t = useT("debts");
  const format = useFormat();
  const date = useDebtDate();
  const { open } = useEntrySheet();
  const [error, setError] = useState("");
  const [, startRemoval] = useTransition();
  const [entries, hide] = useOptimistic(person.entries, (rows, id: string) =>
    rows.filter((row) => row.id !== id),
  );
  const { net, total, done, percent } = person;
  const lent = net > 0;
  const settled = net === 0;
  const ink = lent || settled ? "var(--color-primary-dark)" : "#8f4a33";

  const openEntry = (kind: DebtKind) =>
    open({ type: "debt", kind, personId: person.id });

  const actions: [
    { label: string; kind: DebtKind },
    { label: string; kind: DebtKind },
  ] = settled
    ? [
        { label: t("lent"), kind: "lend" },
        { label: t("borrowed"), kind: "borrow" },
      ]
    : lent
      ? [
          { label: t("gotPaidBack"), kind: "gotBack" },
          { label: t("lentMore"), kind: "lend" },
        ]
      : [
          { label: t("iPaidBack"), kind: "paidBack" },
          { label: t("borrowedMore"), kind: "borrow" },
        ];

  const remove = (id: string) => {
    setError("");
    startRemoval(async () => {
      hide(id);
      const result = await removeDebtEntry(id);
      if (result.error) setError(result.error);
    });
  };

  return (
    <>
      <h1 className="font-display -mt-2 text-[27px] leading-[1.2] font-bold tracking-[-0.01em] md:text-[32px]">
        {person.name}
      </h1>

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <Card className="grid gap-[18px] p-5 md:p-6">
          <div className="flex items-center gap-3">
            <PersonBadge
              name={person.name}
              owing={!lent && !settled}
              className="h-[52px] w-[52px] text-[22px]"
            />
            <span className="grid min-w-0" style={{ color: ink }}>
              <span className="text-[15px] font-medium">
                {t(
                  settled
                    ? "personSettled"
                    : lent
                      ? "personOwesYou"
                      : "personYouOwe",
                )}
              </span>
              <span className="font-display text-[50px] leading-[1.05] font-bold tracking-[-0.02em] md:text-[64px]">
                {format.taka(Math.abs(net))}
              </span>
            </span>
          </div>

          {!settled && (
            <div className="grid gap-2">
              <div className="h-3 rounded-full bg-[#f2eee5]">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${percent}%`,
                    background: lent ? "var(--color-primary)" : "#c98b6f",
                  }}
                />
              </div>
              <span className="text-ink-soft text-[14px]">
                {t(lent ? "progressPaid" : "progressRepaid", {
                  done: format.taka(done),
                  total: format.taka(total),
                })}
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => openEntry(actions[0].kind)}
              className="bg-ink font-display focus-visible:outline-primary h-[52px] cursor-pointer rounded-[14px] text-[16px] font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {actions[0].label}
            </button>
            <button
              type="button"
              onClick={() => openEntry(actions[1].kind)}
              className="border-line bg-surface focus-visible:outline-primary h-[52px] cursor-pointer rounded-[14px] border text-[15px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {actions[1].label}
            </button>
          </div>

          <p className="text-ink-soft text-[14px] leading-[1.55] text-pretty">
            {t("neutral")}
          </p>
        </Card>

        <Card className="grid grid-cols-[minmax(0,1fr)] p-5 md:p-6">
          <h2 className="font-display mb-2.5 text-[19px] font-bold">
            {t("historyTitle")}
          </h2>
          <FormError message={error} />
          <ul>
            {entries.map((entry) => (
              <HistoryRow
                key={entry.id}
                entry={entry}
                date={date(entry)}
                removable={samePeriod(entry, current)}
                onRemove={() => remove(entry.id)}
              />
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}

function HistoryRow({
  entry,
  date,
  removable,
  onRemove,
}: {
  entry: DebtEntryRow;
  date: string;
  removable: boolean;
  onRemove: () => void;
}) {
  const t = useT("debts");
  const format = useFormat();
  const out = isMoneyOut(entry.kind);
  const amount = format.taka(entry.amount);

  return (
    <li className="flex items-start gap-3 border-t border-[#f4f0e7] py-3">
      <DirectionIcon out={out} className="h-9 w-9 rounded-[10px]" />
      <span className="grid min-w-0 flex-1 gap-px">
        <span className="text-[15px] font-semibold">
          {t(kindLabels[entry.kind])}
        </span>
        <span className="text-ink-soft text-[13px]">
          {t(out ? "metaFrom" : "metaInto", {
            date,
            account: entry.accountName,
          })}
        </span>
        {entry.note && (
          <span className="text-ink-soft text-[13px] italic">{entry.note}</span>
        )}
      </span>
      <span className="flex items-center gap-1">
        <span className="font-display text-[16px] font-bold whitespace-nowrap">
          {amount}
        </span>
        {removable && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={t("remove", { amount })}
            className="text-ink-muted hover:text-danger focus-visible:outline-primary -mr-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-[10px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        )}
      </span>
    </li>
  );
}
