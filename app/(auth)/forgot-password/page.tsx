import type { Metadata } from "next";
import Link from "next/link";
import {
  AuthStepLayout,
  authTextLinkClass,
} from "@/components/auth/AuthStepLayout";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("meta");
  return {
    title: t("forgotPasswordTitle"),
    description: t("forgotPasswordDescription"),
  };
}

export default async function ForgotPasswordPage() {
  const t = await getT("auth");

  return (
    <AuthStepLayout title={t("forgotTitle")} subtitle={t("forgotSubtitle")}>
      <ForgotPasswordForm />

      <div className="flex justify-center">
        <Link href="/login" className={authTextLinkClass}>
          {t("backToLogin")}
        </Link>
      </div>
    </AuthStepLayout>
  );
}
