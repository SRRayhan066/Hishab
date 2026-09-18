"use client";

import { useState } from "react";
import type { AuthMode } from "@/types/auth";
import { Logo } from "@/components/icons/Logo";
import { Divider } from "@/components/ui/Divider";
import { FormError } from "@/components/ui/FormError";
import { AuthCard } from "./AuthCard";
import { AuthPanel } from "./AuthPanel";
import { AuthTabs } from "./AuthTabs";
import { GoogleButton } from "./GoogleButton";
import { SignInForm } from "./SignInForm";
import { SignUpForm } from "./SignUpForm";

const copy: Record<
  AuthMode,
  { title: string; subtitle: string; cta: string; note: string }
> = {
  login: {
    title: "আবার স্বাগতম",
    subtitle: "হিসাব যেখানে রেখেছিলে, সেখান থেকেই চলবে।",
    cta: "সাইন ইন",
    note: "তোমার হিসাব নিরাপদে জমা থাকছে, শুধু তুমিই দেখতে পাবে।",
  },
  signup: {
    title: "শুরু করা যাক",
    subtitle: "এক মিনিটের কাজ, তারপর বাজেট বসিয়ে নেবে।",
    cta: "সাইন আপ",
    note: "হিসাব খুললেই তুমি শর্ত ও গোপনীয়তা নীতি মেনে নিচ্ছো।",
  },
};

const panelId = "auth-panel";

export function AuthScreen({ notice }: { notice?: string }) {
  const [mode, setMode] = useState<AuthMode>("login");
  const { title, subtitle, cta, note } = copy[mode];

  return (
    <main className="flex flex-1 items-center justify-center px-[18px] py-7">
      <AuthCard>
        <AuthPanel />

        <div className="flex flex-col gap-5 px-[22px] py-8 sm:px-[34px] md:pt-10 md:pb-9">
          <Logo className="md:hidden" />

          <FormError message={notice} />

          <AuthTabs mode={mode} onChange={setMode} panelId={panelId} />

          <div
            id={panelId}
            role="tabpanel"
            aria-labelledby={`auth-tab-${mode}`}
            className="flex flex-col gap-5"
          >
            <div>
              <h1 className="font-display text-[23px] font-bold">{title}</h1>
              <p className="text-ink-muted mt-[3px] text-[15px]">{subtitle}</p>
            </div>

            {mode === "login" ? (
              <SignInForm cta={cta} />
            ) : (
              <SignUpForm cta={cta} />
            )}
          </div>

          <Divider label="অথবা" />

          <GoogleButton label={`গুগল দিয়ে ${cta}`} />

          <p className="text-ink-muted text-center text-[14px] leading-[1.6]">
            {note}
          </p>
        </div>
      </AuthCard>
    </main>
  );
}
