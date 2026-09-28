"use client";

import { usePathname } from "next/navigation";
import { useT } from "@/lib/i18n/client";
import type { Dictionary } from "@/lib/i18n/dictionaries/bn";

/**
 * The heading lives in the layout, not in each page, so that switching tabs
 * repaints only the screen below it. Reading the name off the path keeps it
 * off the server's critical path: the new title is on screen the moment the
 * tab is tapped, while the numbers are still in flight.
 */
const titles: Record<string, keyof Dictionary["titles"]> = {
  "/home": "home",
  "/add": "add",
  "/budget": "budget",
  "/accounts": "accounts",
  "/history": "history",
  "/profile": "profile",
};

export function ScreenTitle() {
  const pathname = usePathname();
  const t = useT("titles");
  const key = titles[pathname];

  return (
    <h1 className="font-display min-w-0 text-[27px] leading-[1.25] font-bold tracking-[-0.01em]">
      {key ? t(key) : ""}
    </h1>
  );
}
