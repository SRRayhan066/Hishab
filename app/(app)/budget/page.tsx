import type { Metadata } from "next";
import { AppShell } from "@/components/app/AppShell";
import { BudgetScreen } from "@/components/budget/BudgetScreen";
import { getCurrentMonthView } from "@/lib/finance/view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "মাসের বাজেট — টাকার হিসাব",
  description: "মাসে কত আসছে, কোথায় কত যাবে — একবার বসিয়ে নাও।",
};

export default async function BudgetPage() {
  const { data, summary, monthLabel, savingsLabel } =
    await getCurrentMonthView();

  return (
    <AppShell
      title="মাসের বাজেট"
      monthLabel={monthLabel}
      savingsLabel={savingsLabel}
    >
      <BudgetScreen
        // Remounts when the month rolls over, so the carried-forward plan
        // replaces whatever was being edited on a tab left open overnight.
        key={`${summary.year}-${summary.monthIndex}`}
        initialData={data}
        monthName={summary.monthName}
        daysInMonth={summary.daysInMonth}
      />
    </AppShell>
  );
}
