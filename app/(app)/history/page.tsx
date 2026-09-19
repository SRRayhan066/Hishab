import type { Metadata } from "next";
import { AppShell } from "@/components/app/AppShell";
import { CategorySpend } from "@/components/history/CategorySpend";
import { PastMonths } from "@/components/history/PastMonths";
import { buildMonthResults } from "@/lib/finance/history";
import { getCurrentMonthView } from "@/lib/finance/view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "আগের হিসাব — টাকার হিসাব",
  description: "কোন মাসে কত বেঁচেছে, আর এই মাসে কোন খাতে কত গেলো।",
};

export default async function HistoryPage() {
  const { data, summary, monthLabel, savingsLabel } =
    await getCurrentMonthView();

  return (
    <AppShell
      title="আগের হিসাব"
      monthLabel={monthLabel}
      savingsLabel={savingsLabel}
    >
      <PastMonths months={buildMonthResults(data.history)} />
      <CategorySpend categories={summary.categories} />
    </AppShell>
  );
}
