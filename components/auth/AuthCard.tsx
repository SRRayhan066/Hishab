import type { ReactNode } from "react";

export function AuthCard({ children }: { children: ReactNode }) {
  return (
    <div className="bg-surface border-line-soft rounded-card w-full max-w-[940px] overflow-hidden border shadow-[0_4px_18px_rgba(42,40,37,0.05)] md:grid md:grid-cols-2">
      {children}
    </div>
  );
}
