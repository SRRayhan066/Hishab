import type { Metadata } from "next";
import { BurndownCard } from "@/components/home/BurndownCard";
import { CategoryBreakdown } from "@/components/home/CategoryBreakdown";
import { BalanceCard } from "@/components/home/BalanceCard";
import { getCurrentMonthView } from "@/lib/finance/view";

export const metadata: Metadata = {
  title: "এক নজরে",
  description: "এই মাসে আর কত খরচ করা যাবে, এক নজরে।",
};

export default async function HomePage() {
  const { summary } = await getCurrentMonthView();

  return (
    <>
      <BalanceCard summary={summary} />
      <BurndownCard summary={summary} />
      <CategoryBreakdown summary={summary} />
    </>
  );
}
