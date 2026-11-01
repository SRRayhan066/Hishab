import type { Metadata } from "next";
import { CurrencyList } from "@/components/profile/CurrencyList";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("titles");
  return { title: t("profileCurrency") };
}

export default function ProfileCurrencyPage() {
  return <CurrencyList />;
}
