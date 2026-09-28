import type { Metadata } from "next";
import { AddExpenseScreen } from "@/components/add/AddExpenseScreen";
import { getCurrentMonthView } from "@/lib/finance/view";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("meta");
  return {
    title: t("addTitle"),
    description: t("addDescription"),
  };
}

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
