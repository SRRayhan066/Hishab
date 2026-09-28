"use client";

import { useState } from "react";
import type { AuthMode } from "@/types/auth";
import { Logo } from "@/components/icons/Logo";
import { Divider } from "@/components/ui/Divider";
import { FormError } from "@/components/ui/FormError";
import { useT } from "@/lib/i18n/client";
import { AuthCard } from "./AuthCard";
import { AuthPanel } from "./AuthPanel";
import { AuthTabs } from "./AuthTabs";
import { GoogleButton } from "./GoogleButton";
import { SignInForm } from "./SignInForm";
import { SignUpForm } from "./SignUpForm";

const copy = {
  login: {
    title: "loginTitle",
    subtitle: "loginSubtitle",
    cta: "signIn",
    google: "googleSignIn",
    note: "loginNote",
  },
  signup: {
    title: "signupTitle",
    subtitle: "signupSubtitle",
    cta: "signUp",
    google: "googleSignUp",
    note: "signupNote",
  },
} as const satisfies Record<AuthMode, object>;

const panelId = "auth-panel";

export function AuthScreen({ notice }: { notice?: string }) {
  const [mode, setMode] = useState<AuthMode>("login");
  const t = useT("auth");
  const keys = copy[mode];
  const cta = t(keys.cta);

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
              <h1 className="font-display text-[23px] font-bold">
                {t(keys.title)}
              </h1>
              <p className="text-ink-muted mt-[3px] text-[15px]">
                {t(keys.subtitle)}
              </p>
            </div>

            {mode === "login" ? (
              <SignInForm cta={cta} />
            ) : (
              <SignUpForm cta={cta} />
            )}
          </div>

          <Divider label={t("or")} />

          <GoogleButton label={t(keys.google)} />

          <p className="text-ink-muted text-center text-[14px] leading-[1.6]">
            {t(keys.note)}
          </p>
        </div>
      </AuthCard>
    </main>
  );
}
