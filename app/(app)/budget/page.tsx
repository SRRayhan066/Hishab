import type { Metadata } from "next";
import { BudgetScreen } from "@/components/budget/BudgetScreen";
import { PastBudget } from "@/components/budget/PastBudget";
import { getMonthView } from "@/lib/finance/view";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("meta");
  return {
    title: t("budgetTitle"),
    description: t("budgetDescription"),
  };
}

export default async function BudgetPage() {
  const { data, summary } = await getMonthView();

  if (summary.isPast) {
    return (
      <PastBudget
        data={data}
        monthName={summary.monthName}
        daysInMonth={summary.daysInMonth}
      />
    );
  }

  return (
    <BudgetScreen
      // Remounts when the month rolls over, so the carried-forward plan
      // replaces whatever was being edited on a tab left open overnight.
      key={`${summary.year}-${summary.monthIndex}`}
      // Temporary categories belong to this month's spending, not the plan.
      initialData={{
        ...data,
        categories: data.categories.filter((category) => !category.temporary),
      }}
      monthName={summary.monthName}
      daysInMonth={summary.daysInMonth}
    />
  );
}
