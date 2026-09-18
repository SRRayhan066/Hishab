import type { Metadata } from "next";
import Link from "next/link";
import {
  AuthStepLayout,
  authTextLinkClass,
} from "@/components/auth/AuthStepLayout";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "পাসওয়ার্ড ভুলে গেছি — টাকার হিসাব",
  description: "ইমেইলে কোড নিয়ে নতুন পাসওয়ার্ড ঠিক করো।",
};

export default function ForgotPasswordPage() {
  return (
    <AuthStepLayout
      title="পাসওয়ার্ড ভুলে গেছো?"
      subtitle="তোমার হিসাবের ইমেইলটা লেখো। সেখানে একটা ৬ অঙ্কের কোড পাঠাবো।"
    >
      <ForgotPasswordForm />

      <div className="flex justify-center">
        <Link href="/login" className={authTextLinkClass}>
          সাইন ইনে ফিরে যাও
        </Link>
      </div>
    </AuthStepLayout>
  );
}
