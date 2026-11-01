import type { Metadata } from "next";
import { ClearDataForm } from "@/components/profile/ClearDataForm";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("titles");
  return { title: t("profileDelete") };
}

export default function ProfileDeletePage() {
  return <ClearDataForm />;
}
