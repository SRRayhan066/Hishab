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

export const metadata: Metadata = {
  title: "কোড মিলাও — টাকার হিসাব",
  description: "ইমেইলে পাওয়া ৬ অঙ্কের কোডটা লেখো।",
};

export default async function VerifyCodePage() {
  const request = await readResetRequest();
  if (!request) redirect("/forgot-password");

  return (
    <AuthStepLayout
      title="কোডটা লেখো"
      subtitle={
        <>
          <span className="text-ink font-semibold break-all">
            {request.email}
          </span>{" "}
          দিয়ে কোনো হিসাব থাকলে সেখানে একটা ৬ অঙ্কের কোড গেছে। কোডটা{" "}
          {resetCodeMinutes.toLocaleString("bn-BD")} মিনিট কাজ করবে।
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
          ইমেইল বদলাও
        </Link>
      </div>
    </AuthStepLayout>
  );
}
