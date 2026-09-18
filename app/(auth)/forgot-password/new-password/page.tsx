import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthStepLayout } from "@/components/auth/AuthStepLayout";
import { SetPasswordForm } from "@/components/auth/SetPasswordForm";
import { readResetVerified } from "@/lib/auth/password-reset";
import { resetPassword } from "@/app/actions/password-reset";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "নতুন পাসওয়ার্ড — টাকার হিসাব",
  description: "নতুন পাসওয়ার্ড ঠিক করো।",
};

export default async function NewPasswordPage() {
  const verified = await readResetVerified();
  if (!verified) redirect("/forgot-password");

  const user = await db.user.findUnique({
    where: { id: verified.userId },
    select: { email: true },
  });
  if (!user) redirect("/forgot-password");

  return (
    <AuthStepLayout
      title="নতুন পাসওয়ার্ড দাও"
      subtitle="কোড মিলে গেছে। এবার নতুন একটা পাসওয়ার্ড ঠিক করো, তারপর সরাসরি হিসাবে ঢুকে যাবে।"
    >
      <SetPasswordForm
        email={user.email}
        cta="পাসওয়ার্ড বদলাও"
        action={resetPassword}
      />
    </AuthStepLayout>
  );
}
