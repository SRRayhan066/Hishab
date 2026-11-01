"use client";

import { useState } from "react";
import { ArrowLeftRight, Handshake, ShoppingBag } from "lucide-react";
import { viewMonth } from "@/app/actions/month";
import { Sheet, SheetTitle } from "@/components/ui/Sheet";
import type { EntryContext } from "@/lib/finance/view";
import { useT } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";
import { DebtForm } from "./DebtForm";
import {
  useEntrySheet,
  type EntryPreset,
  type EntryType,
} from "./EntrySheetProvider";
import { SpendForm } from "./SpendForm";
import { TransferForm } from "./TransferForm";

const tabs = [
  { type: "spend", label: "tabSpend", icon: ShoppingBag },
  { type: "debt", label: "tabDebt", icon: Handshake },
  { type: "transfer", label: "tabTransfer", icon: ArrowLeftRight },
] as const;

const titles = {
  spend: "titleNew",
  debt: "titleDebt",
  transfer: "titleTransfer",
} as const;

export function EntrySheet({ context }: { context: EntryContext }) {
  const { preset, close } = useEntrySheet();
  const t = useT("entry");

  if (!preset) return null;

  return (
    <Sheet label={t("titleNew")} onClose={close}>
      <EntryForm preset={preset} context={context} onClose={close} />
    </Sheet>
  );
}

type EntryFormProps = {
  preset: EntryPreset;
  context: EntryContext;
  onClose: () => void;
};

function EntryForm({ preset, context, onClose }: EntryFormProps) {
  const t = useT("entry");
  const [type, setType] = useState<EntryType>(preset.type);
  const [amounts, setAmounts] = useState<Record<EntryType, string>>({
    spend: "",
    debt: "",
    transfer: "",
  });

  const fields = {
    context,
    amount: amounts[type],
    onAmount: (value: string) =>
      setAmounts((current) => ({ ...current, [type]: value })),
    onDone: () => {
      onClose();
      if (context.isPast) void viewMonth(null);
    },
  };

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-[18px]">
      <SheetTitle title={t(titles[type])} onClose={onClose} />

      <div
        role="tablist"
        className="bg-field-alt rounded-tabs grid grid-cols-3 gap-1 p-1"
      >
        {tabs.map((tab) => {
          const active = tab.type === type;

          return (
            <button
              key={tab.type}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setType(tab.type)}
              className={cn(
                "rounded-tab focus-visible:outline-primary flex h-10 min-w-0 cursor-pointer items-center justify-center gap-[5px] px-1.5 text-[15px] font-semibold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
                active
                  ? "bg-surface text-ink shadow-[0_1px_3px_rgba(42,40,37,0.1)]"
                  : "text-ink-soft hover:text-ink",
              )}
            >
              <tab.icon className="h-[17px] w-[17px] flex-none" />
              <span className="truncate">{t(tab.label)}</span>
            </button>
          );
        })}
      </div>

      {type === "spend" && <SpendForm {...fields} />}
      {type === "debt" && (
        <DebtForm
          {...fields}
          presetKind={preset.kind}
          presetPersonId={preset.personId}
        />
      )}
      {type === "transfer" && <TransferForm {...fields} />}
    </div>
  );
}
