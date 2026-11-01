import type { Metadata } from "next";
import { SpendingList } from "@/components/spending/SpendingList";
import { listEntries } from "@/lib/finance/entries";
import { getMonthView } from "@/lib/finance/view";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("meta");
  return {
    title: t("spendingTitle"),
    description: t("spendingDescription"),
  };
}

export default async function SpendingPage() {
  const { data, summary } = await getMonthView();

  return (
    <SpendingList
      entries={listEntries(data)}
      monthName={summary.monthName}
      monthIndex={summary.monthIndex}
      today={summary.isPast ? null : summary.day}
    />
  );
}
