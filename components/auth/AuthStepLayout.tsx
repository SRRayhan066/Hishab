import type { ReactNode } from "react";
import { Logo } from "@/components/icons/Logo";
import { AuthCard } from "./AuthCard";
import { AuthPanel } from "./AuthPanel";

type AuthStepLayoutProps = {
  title: string;
  subtitle: ReactNode;
  children: ReactNode;
};

export function AuthStepLayout({
  title,
  subtitle,
  children,
}: AuthStepLayoutProps) {
  return (
    <main className="flex flex-1 items-center justify-center px-[18px] py-7">
      <AuthCard>
        <AuthPanel />

        <div className="flex flex-col gap-5 px-[22px] py-8 sm:px-[34px] md:pt-10 md:pb-9">
          <Logo className="md:hidden" />

          <div>
            <h1 className="font-display text-[23px] font-bold">{title}</h1>
            <p className="text-ink-muted mt-[3px] text-[15px] leading-[1.6]">
              {subtitle}
            </p>
          </div>

          {children}
        </div>
      </AuthCard>
    </main>
  );
}

export const authTextLinkClass =
  "text-ink-muted hover:text-ink focus-visible:outline-primary cursor-pointer rounded-sm text-[15px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
