import type { Metadata } from "next";
import { AddExpenseScreen } from "@/components/add/AddExpenseScreen";
import { RecentEntries } from "@/components/add/RecentEntries";
import { listEntries } from "@/lib/finance/entries";
import { getMonthView } from "@/lib/finance/view";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("meta");
  return {
    title: t("addTitle"),
    description: t("addDescription"),
  };
}

export default async function AddExpensePage() {
  const { data, summary } = await getMonthView();

  if (summary.isPast) {
    return (
      <RecentEntries
        entries={listEntries(data)}
        monthName={summary.monthName}
      />
    );
  }

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
