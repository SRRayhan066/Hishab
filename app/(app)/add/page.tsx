import type { Metadata } from "next";
import { AppShell } from "@/components/app/AppShell";
import { AddExpenseScreen } from "@/components/add/AddExpenseScreen";
import { getCurrentMonthView } from "@/lib/finance/view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "খরচ যোগ করা — টাকার হিসাব",
  description: "আজকের খরচ এক জায়গায় লিখে রাখো।",
};

export default async function AddExpensePage() {
  const { data, summary, monthLabel, savingsLabel } =
    await getCurrentMonthView();

  return (
    <AppShell
      title="খরচ যোগ করা"
      monthLabel={monthLabel}
      savingsLabel={savingsLabel}
    >
      <AddExpenseScreen
        data={data}
        summary={summary}
        reference={{
          year: summary.year,
          monthIndex: summary.monthIndex,
          day: summary.day,
        }}
      />
    </AppShell>
  );
}
