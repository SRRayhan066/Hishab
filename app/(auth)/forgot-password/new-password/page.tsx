import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthStepLayout } from "@/components/auth/AuthStepLayout";
import { SetPasswordForm } from "@/components/auth/SetPasswordForm";
import { readResetVerified } from "@/lib/auth/password-reset";
import { resetPassword } from "@/app/actions/password-reset";
import { db } from "@/lib/db";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("meta");
  return {
    title: t("newPasswordTitle"),
    description: t("newPasswordDescription"),
  };
}

export default async function NewPasswordPage() {
  const verified = await readResetVerified();
  if (!verified) redirect("/forgot-password");

  const user = await db.user.findUnique({
    where: { id: verified.userId },
    select: { email: true },
  });
  if (!user) redirect("/forgot-password");

  const t = await getT("auth");

  return (
    <AuthStepLayout
      title={t("newPasswordTitle")}
      subtitle={t("newPasswordSubtitle")}
    >
      <SetPasswordForm
        email={user.email}
        cta={t("changePassword")}
        action={resetPassword}
      />
    </AuthStepLayout>
  );
}
