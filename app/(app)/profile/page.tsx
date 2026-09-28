import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ClearDataCard } from "@/components/profile/ClearDataCard";
import { NameCard } from "@/components/profile/NameCard";
import { PasswordCard } from "@/components/profile/PasswordCard";
import { ProfileSummary } from "@/components/profile/ProfileSummary";
import { SignOutCard } from "@/components/profile/SignOutCard";
import { TourCard } from "@/components/profile/TourCard";
import { loadProfile } from "@/lib/auth/profile";
import { getSessionUserId } from "@/lib/auth/session";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("meta");
  return {
    title: t("profileTitle"),
    description: t("profileDescription"),
  };
}

export default async function ProfilePage() {
  const userId = await getSessionUserId();
  const profile = userId ? await loadProfile(userId) : null;
  if (!profile) redirect("/login");

  return (
    <>
      <ProfileSummary profile={profile} />
      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        <NameCard name={profile.name} email={profile.email} />
        <PasswordCard email={profile.email} />
      </div>
      <TourCard />
      <ClearDataCard entries={profile.entries} />
      <SignOutCard />
    </>
  );
}
