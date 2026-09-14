import type { Metadata } from "next";
import { AppShell } from "@/components/app/AppShell";
import { BurndownCard } from "@/components/home/BurndownCard";
import { CarryWarning } from "@/components/home/CarryWarning";
import { CategoryBreakdown } from "@/components/home/CategoryBreakdown";
import { SafeToSpendCard } from "@/components/home/SafeToSpendCard";
import { getCurrentMonthView } from "@/lib/finance/view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "এক নজরে — টাকার হিসাব",
  description: "এই মাসে আর কত খরচ করা যাবে, এক নজরে।",
};

export default function HomePage() {
  const { summary, monthLabel, savingsLabel } = getCurrentMonthView();

  return (
    <AppShell
      title="এক নজরে"
      monthLabel={monthLabel}
      savingsLabel={savingsLabel}
    >
      <CarryWarning
        overCarry={summary.overCarry}
        adjustedBudget={summary.adjustedBudget}
      />
      <SafeToSpendCard summary={summary} />
      <BurndownCard summary={summary} />
      <CategoryBreakdown summary={summary} />
    </AppShell>
  );
}
