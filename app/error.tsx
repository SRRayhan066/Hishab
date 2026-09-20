"use client";

import { RetryNotice } from "@/components/app/RetryNotice";

/**
 * The outermost boundary below the root layout.
 *
 * A layout's own throw is caught by the boundary *above* it, so this is what
 * handles the header reads in `(app)/layout.tsx` — `MonthLine` and
 * `SavingsStatus` — which are the queries that run on every single screen and
 * therefore the ones most likely to meet a dead connection. Without this file
 * they fell through to the framework's "This page couldn't load" page.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col justify-center px-4 py-10">
      <div className="mx-auto w-full max-w-[420px]">
        <RetryNotice error={error} reset={reset} />
      </div>
    </div>
  );
}
