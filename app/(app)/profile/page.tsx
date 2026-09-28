import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ClearDataCard } from "@/components/profile/ClearDataCard";
import { NameCard } from "@/components/profile/NameCard";
import { PasswordCard } from "@/components/profile/PasswordCard";
import { ProfileSummary } from "@/components/profile/ProfileSummary";
import { SignOutCard } from "@/components/profile/SignOutCard";
import { loadProfile } from "@/lib/auth/profile";
import { getSessionUserId } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "প্রোফাইল",
  description: "নাম, পাসওয়ার্ড, ডেটা আর সাইন আউট।",
};

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
      <ClearDataCard entries={profile.entries} />
      <SignOutCard />
    </>
  );
}
