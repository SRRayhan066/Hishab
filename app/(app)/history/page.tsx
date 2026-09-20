import type { Metadata } from "next";
import { CategorySpend } from "@/components/history/CategorySpend";
import { PastMonths } from "@/components/history/PastMonths";
import { buildMonthResults } from "@/lib/finance/history";
import { getCurrentMonthView } from "@/lib/finance/view";

export const metadata: Metadata = {
  title: "আগের হিসাব",
  description: "কোন মাসে কত বেঁচেছে, আর এই মাসে কোন খাতে কত গেলো।",
};

export default async function HistoryPage() {
  const { data, summary } = await getCurrentMonthView();

  return (
    <>
      <PastMonths months={buildMonthResults(data.history)} />
      <CategorySpend categories={summary.categories} />
    </>
  );
}
