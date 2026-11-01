import type { Metadata } from "next";
import { BalanceCard } from "@/components/home/BalanceCard";
import { BurndownCard } from "@/components/home/BurndownCard";
import { CategoryBreakdown } from "@/components/home/CategoryBreakdown";
import { RecentSpending } from "@/components/home/RecentSpending";
import { listEntries } from "@/lib/finance/entries";
import { getMonthView } from "@/lib/finance/view";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("meta");
  return {
    title: t("homeTitle"),
    description: t("homeDescription"),
  };
}

export default async function HomePage() {
  const { data, summary } = await getMonthView();

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
      <div className="grid min-w-0 gap-4">
        <BalanceCard summary={summary} />
        <BurndownCard summary={summary} />
      </div>
      <div className="grid min-w-0 gap-4">
        <CategoryBreakdown summary={summary} />
        <RecentSpending
          entries={listEntries(data).slice(0, 3)}
          summary={summary}
        />
      </div>
    </div>
  );
}
