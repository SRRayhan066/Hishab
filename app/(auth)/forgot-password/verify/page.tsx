import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AuthStepLayout,
  authTextLinkClass,
} from "@/components/auth/AuthStepLayout";
import { VerifyCodeForm } from "@/components/auth/VerifyCodeForm";
import { ResendCodeButton } from "@/components/auth/ResendCodeButton";
import {
  readResetRequest,
  resendCooldownSeconds,
  resetCodeMinutes,
  secondsUntilResend,
} from "@/lib/auth/password-reset";
import { getFormat, getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("meta");
  return {
    title: t("verifyCodeTitle"),
    description: t("verifyCodeDescription"),
  };
}

export default async function VerifyCodePage() {
  const request = await readResetRequest();
  if (!request) redirect("/forgot-password");

  const [t, format] = await Promise.all([getT("auth"), getFormat()]);

  return (
    <AuthStepLayout
      title={t("verifyTitle")}
      subtitle={
        <>
          {t("verifyBefore")}
          <span className="text-ink font-semibold break-all">
            {request.email}
          </span>
          {t("verifyAfter", { minutes: format.number(resetCodeMinutes) })}
        </>
      }
    >
      <VerifyCodeForm />

      <ResendCodeButton
        initialSeconds={secondsUntilResend(request.sentAt)}
        cooldownSeconds={resendCooldownSeconds}
      />

      <div className="flex justify-center">
        <Link href="/forgot-password" className={authTextLinkClass}>
          {t("changeEmail")}
        </Link>
      </div>
    </AuthStepLayout>
  );
}
