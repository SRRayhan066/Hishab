import type { Metadata } from "next";
import { ClearDataCard } from "@/components/profile/ClearDataCard";
import { NameCard } from "@/components/profile/NameCard";
import { PasswordCard } from "@/components/profile/PasswordCard";
import { ProfileSummary } from "@/components/profile/ProfileSummary";
import { SignOutCard } from "@/components/profile/SignOutCard";

export const metadata: Metadata = {
  title: "প্রোফাইল",
  description: "নাম, পাসওয়ার্ড, ডেটা আর সাইন আউট।",
};

const profile = {
  name: "সফিকুল রহমান",
  email: "shafikul@example.com",
  joinedLabel: "সেপ্টেম্বর ২০২৬",
  provider: "email" as const,
  monthsTracked: 4,
  entries: 128,
};

export default function ProfilePage() {
  return (
    <>
      <ProfileSummary profile={profile} />
      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        <NameCard name={profile.name} email={profile.email} />
        <PasswordCard />
      </div>
      <ClearDataCard monthsTracked={profile.monthsTracked} entries={profile.entries} />
      <SignOutCard />
    </>
  );
}
