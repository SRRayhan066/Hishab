import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ProfileMenu } from "@/components/profile/ProfileMenu";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { loadProfile } from "@/lib/auth/profile";
import { getSessionUserId } from "@/lib/auth/session";
import { getFormat, getT } from "@/lib/i18n/server";

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

  const [t, format] = await Promise.all([getT("profile"), getFormat()]);

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 md:grid-cols-2">
      <Card className="flex items-center gap-4 p-5 md:p-6">
        <Avatar seed={profile.email} animate="always" className="h-[68px] w-[68px]" />
        <span className="grid min-w-0 gap-0.5">
          <span className="font-display truncate text-[24px] leading-[1.2] font-bold">
            {profile.name}
          </span>
          <span className="text-ink-soft truncate text-[14px]">{profile.email}</span>
          <span className="text-ink-soft text-[13px]">
            {t("since", {
              month: format.month(profile.joined.month - 1),
              year: format.digits(profile.joined.year),
            })}
            {" · "}
            {t(profile.monthsTracked === 1 ? "monthsTrackedOne" : "monthsTracked", {
              count: format.number(profile.monthsTracked),
            })}
          </span>
        </span>
      </Card>
      <ProfileMenu />
    </div>
  );
}
