import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { readPendingGoogleSignUp } from "@/lib/auth/google";
import { CompleteSignUpScreen } from "@/components/auth/CompleteSignUpScreen";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("meta");
  return {
    title: t("completeSignUpTitle"),
    description: t("completeSignUpDescription"),
  };
}

export default async function CompleteSignUpPage() {
  const pending = await readPendingGoogleSignUp();
  if (!pending) redirect("/login?error=google-expired");

  return <CompleteSignUpScreen name={pending.name} email={pending.email} />;
}
