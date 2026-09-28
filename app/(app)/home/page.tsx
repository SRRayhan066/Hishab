import type { Metadata } from "next";
import { BurndownCard } from "@/components/home/BurndownCard";
import { CategoryBreakdown } from "@/components/home/CategoryBreakdown";
import { BalanceCard } from "@/components/home/BalanceCard";
import { getCurrentMonthView } from "@/lib/finance/view";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("meta");
  return {
    title: t("homeTitle"),
    description: t("homeDescription"),
  };
}

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
