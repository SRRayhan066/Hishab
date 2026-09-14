"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { href: "/home", label: "হোম" },
  { href: "/add", label: "খরচ" },
  { href: "/budget", label: "বাজেট" },
  { href: "/savings", label: "জমা" },
  { href: "/history", label: "হিসাব" },
];

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
              className={cn(
                "focus-visible:outline-primary flex min-h-12 flex-1 items-center justify-center rounded-[14px] px-[6px] py-3 text-[15px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
                active
                  ? "bg-field-alt text-ink font-bold"
                  : "text-ink-muted hover:bg-field-alt font-medium",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
