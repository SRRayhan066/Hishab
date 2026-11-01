import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PasswordForm } from "@/components/profile/PasswordForm";
import { loadProfile } from "@/lib/auth/profile";
import { getSessionUserId } from "@/lib/auth/session";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("titles");
  return { title: t("profilePassword") };
}

export default async function ProfilePasswordPage() {
  const userId = await getSessionUserId();
  const profile = userId ? await loadProfile(userId) : null;
  if (!profile) redirect("/login");

  return <PasswordForm email={profile.email} />;
}
