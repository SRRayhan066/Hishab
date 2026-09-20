"use client";

import { RetryNotice } from "@/components/app/RetryNotice";

/**
 * Catches a throw from one of the app screens. It sits inside `AppShell`, so
 * the header and the tab bar stay on screen and stay usable — a failed read on
 * one tab doesn't cost the user the rest of the app.
 *
 * It cannot catch a throw from `(app)/layout.tsx` itself; `app/error.tsx`
 * handles that one.
 */
export default function AppScreenError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RetryNotice error={error} reset={reset} />;
}
