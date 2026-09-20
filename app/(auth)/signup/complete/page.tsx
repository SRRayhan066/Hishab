import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { readPendingGoogleSignUp } from "@/lib/auth/google";
import { CompleteSignUpScreen } from "@/components/auth/CompleteSignUpScreen";

export const metadata: Metadata = {
  title: "পাসওয়ার্ড ঠিক করো",
  description: "গুগল দিয়ে হিসাব খোলার শেষ ধাপ।",
};

export default async function CompleteSignUpPage() {
  const pending = await readPendingGoogleSignUp();
  if (!pending) redirect("/login?error=google-expired");

  return <CompleteSignUpScreen name={pending.name} email={pending.email} />;
}
