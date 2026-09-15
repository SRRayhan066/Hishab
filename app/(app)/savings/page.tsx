import type { Metadata } from "next";
import { SavingsScreen } from "@/components/savings/SavingsScreen";
import { buildMonthSummary } from "@/lib/finance/summary";
import { getMockMonthData } from "@/lib/mock/month";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "জমানো টাকা — টাকার হিসাব",
  description: "এ পর্যন্ত কত জমলো, আর এই মাসে কত জমছে।",
};

export default function SavingsPage() {
  const now = new Date();
  const data = getMockMonthData(now);
  const summary = buildMonthSummary(data, now);

  return (
    <SavingsScreen
      openingSavings={data.openingSavings}
      history={data.history}
      thisMonthSaving={
        summary.incomeTotal - summary.fixedTotal - summary.projected
      }
      monthLabel={`${summary.monthName} ${summary.year} · ${summary.daysLeft} দিন বাকি`}
    />
  );
}
