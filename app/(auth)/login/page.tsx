import type { Metadata } from "next";
import { AuthScreen } from "@/components/auth/AuthScreen";

export const metadata: Metadata = {
  title: "সাইন ইন — টাকার হিসাব",
  description: "হিসাব যেখানে রেখেছিলে, সেখান থেকেই চলবে।",
};

export default function LoginPage() {
  return <AuthScreen />;
}
