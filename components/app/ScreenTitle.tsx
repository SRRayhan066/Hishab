"use client";

import { usePathname } from "next/navigation";

/**
 * The heading lives in the layout, not in each page, so that switching tabs
 * repaints only the screen below it. Reading the name off the path keeps it
 * off the server's critical path: the new title is on screen the moment the
 * tab is tapped, while the numbers are still in flight.
 */
const titles: Record<string, string> = {
  "/home": "এক নজরে",
  "/add": "খরচ যোগ করা",
  "/budget": "মাসের বাজেট",
  "/savings": "জমা ও ব্যালেন্স",
  "/history": "আগের হিসাব",
};

export function ScreenTitle() {
  const pathname = usePathname();

  return (
    <h1 className="font-display min-w-0 text-[27px] leading-[1.25] font-bold tracking-[-0.01em]">
      {titles[pathname] ?? ""}
    </h1>
  );
}
