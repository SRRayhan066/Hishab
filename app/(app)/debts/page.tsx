import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DebtsScreen } from "@/components/debts/DebtsScreen";
import { getSessionUserId } from "@/lib/auth/session";
import { loadDebtBook } from "@/lib/finance/debt-store";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("meta");
  return {
    title: t("debtsTitle"),
    description: t("debtsDescription"),
  };
}

export default async function DebtsPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  return <DebtsScreen book={await loadDebtBook(userId)} />;
}
