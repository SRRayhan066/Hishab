import type { Metadata } from "next";
import { AppShell } from "@/components/app/AppShell";
import { AddExpenseScreen } from "@/components/add/AddExpenseScreen";
import { getMockMonthData } from "@/lib/mock/month";
import { buildMonthSummary } from "@/lib/finance/summary";
import { formatTaka } from "@/lib/finance/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "খরচ যোগ করা — টাকার হিসাব",
  description: "আজকের খরচ এক জায়গায় লিখে রাখো।",
};

export default function AddExpensePage() {
  const now = new Date();
  const data = getMockMonthData(now);
  const summary = buildMonthSummary(data, now);

  return (
    <AppShell
      title="খরচ যোগ করা"
      monthLabel={`${summary.monthName} ${summary.year} · ${summary.daysLeft} দিন বাকি`}
      savingsLabel={formatTaka(summary.totalSavings)}
    >
      <AddExpenseScreen
        initialData={data}
        reference={{
          year: summary.year,
          monthIndex: summary.monthIndex,
          day: summary.day,
        }}
      />
    </AppShell>
  );
}
