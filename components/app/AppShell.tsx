import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

type AppShellProps = {
  title: string;
  monthLabel: string;
  savingsLabel: string;
  children: ReactNode;
};

export function AppShell({
  title,
  monthLabel,
  savingsLabel,
  children,
}: AppShellProps) {
  return (
    <div className="flex-1 px-4 pt-[22px]">
      <div className="mx-auto flex w-full max-w-[1060px] flex-col gap-4">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-ink-muted text-[14px] font-medium">
              {monthLabel}
            </p>
            <h1 className="font-display mt-px text-[27px] leading-[1.25] font-bold tracking-[-0.01em]">
              {title}
            </h1>
          </div>
          <p className="bg-surface border-line-soft text-ink-soft rounded-full border px-[18px] py-[10px] text-[14px] font-semibold">
            জমা আছে {savingsLabel}
          </p>
        </header>

        <main className="flex flex-col gap-4">{children}</main>

        <BottomNav />
      </div>
    </div>
  );
}
