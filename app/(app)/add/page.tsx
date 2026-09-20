import type { Metadata } from "next";
import { AddExpenseScreen } from "@/components/add/AddExpenseScreen";
import { getCurrentMonthView } from "@/lib/finance/view";

export const metadata: Metadata = {
  title: "খরচ যোগ করা",
  description: "আজকের খরচ এক জায়গায় লিখে রাখো।",
};

export default async function AddExpensePage() {
  const { data, summary } = await getCurrentMonthView();

  return (
    <AddExpenseScreen
      data={data}
      summary={summary}
      reference={{
        year: summary.year,
        monthIndex: summary.monthIndex,
        day: summary.day,
      }}
    />
  );
}
