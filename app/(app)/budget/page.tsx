import type { Metadata } from "next";
import { AppShell } from "@/components/app/AppShell";
import { BudgetScreen } from "@/components/budget/BudgetScreen";
import { formatTaka } from "@/lib/finance/format";
import { buildMonthSummary } from "@/lib/finance/summary";
import { getMockMonthData } from "@/lib/mock/month";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "মাসের বাজেট — টাকার হিসাব",
  description: "মাসে কত আসছে, কোথায় কত যাবে — একবার বসিয়ে নাও।",
};

export default function BudgetPage() {
  const now = new Date();
  const data = getMockMonthData(now);
  const summary = buildMonthSummary(data, now);

  return (
    <AppShell
      title="মাসের বাজেট"
      monthLabel={`${summary.monthName} ${summary.year} · ${summary.daysLeft} দিন বাকি`}
      savingsLabel={formatTaka(summary.totalSavings)}
    >
      <BudgetScreen
        initialData={data}
        monthName={summary.monthName}
        daysInMonth={summary.daysInMonth}
      />
    </AppShell>
  );
}
