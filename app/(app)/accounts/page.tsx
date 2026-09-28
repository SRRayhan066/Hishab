import type { Metadata } from "next";
import { AccountsScreen } from "@/components/accounts/AccountsScreen";
import { getCurrentMonthView } from "@/lib/finance/view";

export const metadata: Metadata = {
  title: "অ্যাকাউন্ট",
  description: "কোন অ্যাকাউন্টে কত আছে, আর এক অ্যাকাউন্ট থেকে আরেকটায় টাকা সরানো।",
};

export default async function AccountsPage() {
  const { data, summary } = await getCurrentMonthView();

  return (
    <AccountsScreen
      key={`${summary.year}-${summary.monthIndex}`}
      accounts={data.accounts}
      transfers={data.transfers}
      history={data.history}
      thisMonthNet={summary.incomeTotal - summary.spentTotal}
      projectedNet={summary.incomeTotal - summary.projected}
      monthName={summary.monthName}
      reference={{
        year: summary.year,
        monthIndex: summary.monthIndex,
        day: summary.day,
      }}
    />
  );
}
