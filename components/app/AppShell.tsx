import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { AccountMenu } from "./AccountMenu";
import { SavingsChip } from "./SavingsChip";

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
    <div className="flex flex-1 flex-col px-4 pt-[22px]">
      <div className="mx-auto flex w-full max-w-[1060px] flex-1 flex-col gap-4">
        <header>
          <p className="text-ink-muted text-[14px] font-medium">
            {monthLabel}
          </p>
          <div className="mt-px flex items-center justify-between gap-3">
            <h1 className="font-display min-w-0 text-[27px] leading-[1.25] font-bold tracking-[-0.01em]">
              {title}
            </h1>
            <div className="flex flex-none items-center gap-2">
              <SavingsChip label={savingsLabel} />
              <AccountMenu />
            </div>
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-4">{children}</main>

        <BottomNav />
      </div>
    </div>
  );
}
