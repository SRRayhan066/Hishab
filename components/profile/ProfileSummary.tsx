import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import type { Profile } from "@/lib/auth/profile";
import { getFormat, getT } from "@/lib/i18n/server";

export async function ProfileSummary({ profile }: { profile: Profile }) {
  const [t, format] = await Promise.all([getT("profile"), getFormat()]);

  return (
    <Card className="px-6 pt-[26px] pb-7">
      <div className="flex items-center gap-4">
        <Avatar seed={profile.email} animate="always" className="h-[68px] w-[68px]" />
        <div className="min-w-0">
          <p className="font-display truncate text-[26px] leading-[1.2] font-bold tracking-[-0.01em]">
            {profile.name}
          </p>
          <p className="text-ink-muted mt-0.5 truncate text-[15px]">
            {profile.email}
          </p>
        </div>
      </div>

      <dl className="mt-6 grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(160px,1fr))]">
        <div className="bg-field rounded-[16px] px-[18px] py-4">
          <dt className="text-ink-muted text-[14px]">{t("joined")}</dt>
          <dd className="font-display mt-0.5 text-[20px] font-bold">
            {t("joinedValue", {
              month: format.month(profile.joined.month - 1),
              year: format.digits(profile.joined.year),
            })}
          </dd>
        </div>

        <div className="bg-field rounded-[16px] px-[18px] py-4">
          <dt className="text-ink-muted text-[14px]">{t("tracking")}</dt>
          <dd className="font-display mt-0.5 text-[20px] font-bold">
            {t(profile.monthsTracked === 1 ? "monthsTrackedOne" : "monthsTracked", {
              count: format.number(profile.monthsTracked),
            })}
          </dd>
        </div>
      </dl>
    </Card>
  );
}
