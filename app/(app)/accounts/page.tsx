import type { Metadata } from "next";
import { AccountsScreen } from "@/components/accounts/AccountsScreen";
import { getCurrentMonthView } from "@/lib/finance/view";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("meta");
  return {
    title: t("accountsTitle"),
    description: t("accountsDescription"),
  };
}

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
