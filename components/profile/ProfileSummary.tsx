import { Mail } from "lucide-react";
import { GoogleIcon } from "@/components/icons/GoogleIcon";
import { Card } from "@/components/ui/Card";

type ProfileSummaryProps = {
  profile: {
    name: string;
    email: string;
    joinedLabel: string;
    provider: "email" | "google";
    monthsTracked: number;
  };
};

export function ProfileSummary({ profile }: ProfileSummaryProps) {
  const initial = profile.name.trim().charAt(0);
  const google = profile.provider === "google";

  return (
    <Card className="px-6 pt-[26px] pb-7">
      <div className="flex items-center gap-4">
        <span
          aria-hidden
          className="bg-panel text-primary-dark font-display flex h-[68px] w-[68px] flex-none items-center justify-center rounded-full text-[30px] font-bold"
        >
          {initial}
        </span>
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
          <dt className="text-ink-muted text-[14px]">যোগ দিয়েছ</dt>
          <dd className="font-display mt-0.5 text-[20px] font-bold">
            {profile.joinedLabel}
          </dd>
        </div>

        <div className="bg-field rounded-[16px] px-[18px] py-4">
          <dt className="text-ink-muted text-[14px]">হিসাব রাখছ</dt>
          <dd className="font-display mt-0.5 text-[20px] font-bold">
            {profile.monthsTracked} মাস ধরে
          </dd>
        </div>

        <div className="bg-panel rounded-[16px] px-[18px] py-4">
          <dt className="text-ink-soft text-[14px]">লগইন করো</dt>
          <dd className="text-primary-dark font-display mt-0.5 flex items-center gap-2 text-[20px] font-bold">
            {google ? (
              <GoogleIcon className="h-[18px] w-[18px]" />
            ) : (
              <Mail className="h-[18px] w-[18px]" />
            )}
            {google ? "Google দিয়ে" : "ইমেইল দিয়ে"}
          </dd>
        </div>
      </dl>
    </Card>
  );
}
