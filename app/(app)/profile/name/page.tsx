import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { NameForm } from "@/components/profile/NameForm";
import { loadProfile } from "@/lib/auth/profile";
import { getSessionUserId } from "@/lib/auth/session";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("titles");
  return { title: t("profileName") };
}

export default async function ProfileNamePage() {
  const userId = await getSessionUserId();
  const profile = userId ? await loadProfile(userId) : null;
  if (!profile) redirect("/login");

  return <NameForm name={profile.name} email={profile.email} />;
}
