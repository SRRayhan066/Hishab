import type { ReactNode } from "react";

export function AuthCard({ children }: { children: ReactNode }) {
  return (
    <div className="md:bg-surface md:border-line-soft md:rounded-card w-full max-w-[540px] overflow-hidden md:border md:shadow-[0_4px_18px_rgba(42,40,37,0.05)] xl:grid xl:max-w-[940px] xl:grid-cols-2">
      {children}
    </div>
  );
}
