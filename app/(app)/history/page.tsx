import type { Metadata } from "next";
import { AppShell } from "@/components/app/AppShell";
import { CategorySpend } from "@/components/history/CategorySpend";
import { PastMonths } from "@/components/history/PastMonths";
import { formatTaka } from "@/lib/finance/format";
import { buildMonthResults } from "@/lib/finance/history";
import { buildMonthSummary } from "@/lib/finance/summary";
import { getMockMonthData } from "@/lib/mock/month";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "আগের হিসাব — টাকার হিসাব",
  description: "কোন মাসে কত বেঁচেছে, আর এই মাসে কোন খাতে কত গেলো।",
};

export default function HistoryPage() {
  const now = new Date();
  const data = getMockMonthData(now);
  const summary = buildMonthSummary(data, now);

  return (
    <AppShell
      title="আগের হিসাব"
      monthLabel={`${summary.monthName} ${summary.year} · ${summary.daysLeft} দিন বাকি`}
      savingsLabel={formatTaka(summary.totalSavings)}
    >
      <PastMonths months={buildMonthResults(data.history)} />
      <CategorySpend categories={summary.categories} />
    </AppShell>
  );
}
