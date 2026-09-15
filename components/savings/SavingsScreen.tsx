"use client";

import { useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { formatTaka } from "@/lib/finance/format";
import { buildSavingsView } from "@/lib/finance/savings";
import type { PastMonth } from "@/lib/finance/types";
import { OpeningSavingsCard } from "./OpeningSavingsCard";
import { SavingsHistory } from "./SavingsHistory";
import { SavingsSummary } from "./SavingsSummary";

type SavingsScreenProps = {
  openingSavings: number;
  history: PastMonth[];
  thisMonthSaving: number;
  monthLabel: string;
};

export function SavingsScreen({
  openingSavings,
  history,
  thisMonthSaving,
  monthLabel,
}: SavingsScreenProps) {
  const [opening, setOpening] = useState(String(openingSavings));

  const view = buildSavingsView(
    Number(opening) || 0,
    history,
    thisMonthSaving,
  );

  return (
    <AppShell
      title="জমানো টাকা"
      monthLabel={monthLabel}
      savingsLabel={formatTaka(view.total)}
    >
      <SavingsSummary view={view} />
      <OpeningSavingsCard value={opening} onChange={setOpening} />
      <SavingsHistory months={view.months} />
    </AppShell>
  );
}
