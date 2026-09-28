import { SignOutButton } from "@/components/app/SignOutButton";
import { Card } from "@/components/ui/Card";
import { getT } from "@/lib/i18n/server";

export async function SignOutCard() {
  const [t, common] = await Promise.all([getT("profile"), getT("common")]);

  return (
    <Card className="flex flex-col gap-4 px-[22px] pt-[22px] pb-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="font-display text-[18px] font-bold">{common("signOut")}</h2>
        <p className="text-ink-muted mt-0.5 text-[14px] leading-[1.55]">
          {t("signOutHint")}
        </p>
      </div>
      <SignOutButton />
    </Card>
  );
}
