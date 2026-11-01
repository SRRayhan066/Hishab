import type { Metadata } from "next";
import { CategorySpend } from "@/components/history/CategorySpend";
import { PastMonths } from "@/components/history/PastMonths";
import { buildMonthResults } from "@/lib/finance/history";
import { getMonthView } from "@/lib/finance/view";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("meta");
  return {
    title: t("historyTitle"),
    description: t("historyDescription"),
  };
}

export default async function HistoryPage() {
  const { data, summary } = await getMonthView();

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 md:grid-cols-2">
      <PastMonths months={buildMonthResults(data.history)} />
      <CategorySpend
        categories={summary.categories}
        isPast={summary.isPast}
        monthName={summary.monthName}
      />
    </div>
  );
}
