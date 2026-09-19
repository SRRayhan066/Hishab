import type { Metadata } from "next";
import { AppShell } from "@/components/app/AppShell";
import { BurndownCard } from "@/components/home/BurndownCard";
import { CategoryBreakdown } from "@/components/home/CategoryBreakdown";
import { BalanceCard } from "@/components/home/BalanceCard";
import { getCurrentMonthView } from "@/lib/finance/view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "এক নজরে — টাকার হিসাব",
  description: "এই মাসে আর কত খরচ করা যাবে, এক নজরে।",
};

export default async function HomePage() {
  const { summary, monthLabel, savingsLabel } = await getCurrentMonthView();

  return (
    <AppShell
      title="এক নজরে"
      monthLabel={monthLabel}
      savingsLabel={savingsLabel}
    >
      <BalanceCard summary={summary} />
      <BurndownCard summary={summary} />
      <CategoryBreakdown summary={summary} />
    </AppShell>
  );
}
