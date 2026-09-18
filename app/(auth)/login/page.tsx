import type { Metadata } from "next";
import { AuthScreen } from "@/components/auth/AuthScreen";
import { loginNotices } from "@/lib/auth/messages";

export const metadata: Metadata = {
  title: "সাইন ইন — টাকার হিসাব",
  description: "হিসাব যেখানে রেখেছিলে, সেখান থেকেই চলবে।",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { error } = await searchParams;
  const notice = typeof error === "string" ? loginNotices[error] : undefined;

  return <AuthScreen notice={notice} />;
}
