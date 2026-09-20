"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { href: "/home", label: "হোম" },
  { href: "/add", label: "খরচ" },
  { href: "/budget", label: "বাজেট" },
  { href: "/savings", label: "জমা" },
  { href: "/history", label: "হিসাব" },
];

/**
 * The pill is a child of the link rather than the link itself, because only a
 * child can read `useLinkStatus`. On a phone connection the reply can take a
 * moment, and a tab that stays dead under the thumb reads as a broken app —
 * so a tab that is still loading looks selected straight away.
 */
function NavPill({ label, active }: { label: string; active: boolean }) {
  const { pending } = useLinkStatus();
  const selected = active || pending;

  return (
    <span
      className={cn(
        "flex min-h-12 flex-1 items-center justify-center rounded-[14px] px-[6px] py-3 text-[15px] transition-colors",
        selected
          ? "bg-field-alt text-ink font-bold"
          : "text-ink-muted hover:bg-field-alt font-medium",
      )}
    >
      {label}
    </span>
  );
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="প্রধান মেনু"
      className="sticky bottom-0 bg-gradient-to-t from-canvas from-64% to-transparent pt-3 pb-[18px]"
    >
      <div className="bg-surface flex gap-[6px] rounded-[20px] border-[1.5px] border-[#e6e0d4] p-2 shadow-[0_6px_20px_rgba(42,40,37,0.08)]">
        {items.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className="focus-visible:outline-primary flex flex-1 rounded-[14px] focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <NavPill label={item.label} active={active} />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
