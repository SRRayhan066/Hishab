import { Suspense, type ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { AccountMenu } from "./AccountMenu";
import { MonthLine, MonthLineFallback, SavingsStatus } from "./HeaderStatus";
import { SavingsChipFallback } from "./SavingsChip";
import { ScreenTitle } from "./ScreenTitle";

/**
 * The chrome every signed-in screen sits in. It lives in the route group's
 * layout, so switching tabs swaps `children` and leaves the header and the
 * tab bar mounted — no re-render, no re-fetch, and the tab highlight moves on
 * the tap rather than on the server's reply.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col px-4 pt-[22px]">
      <div className="mx-auto flex w-full max-w-[1060px] flex-1 flex-col gap-4">
        <header>
          <Suspense fallback={<MonthLineFallback />}>
            <MonthLine />
          </Suspense>
          <div className="mt-px flex items-center justify-between gap-3">
            <ScreenTitle />
            <div className="flex flex-none items-center gap-2">
              <Suspense fallback={<SavingsChipFallback />}>
                <SavingsStatus />
              </Suspense>
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
