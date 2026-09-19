import type { Metadata } from "next";
import { SavingsScreen } from "@/components/savings/SavingsScreen";
import { getCurrentMonthView } from "@/lib/finance/view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "জমানো টাকা — টাকার হিসাব",
  description: "এ পর্যন্ত কত জমলো, আর এই মাসে কত জমছে।",
};

export default async function SavingsPage() {
  const { data, summary, monthLabel } = await getCurrentMonthView();

  return (
    <SavingsScreen
      openingBalance={data.openingBalance}
      history={data.history}
      thisMonthNet={summary.incomeTotal - summary.spentTotal}
      projectedNet={summary.incomeTotal - summary.projected}
      monthLabel={monthLabel}
    />
  );
}
