"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

export function ProfileLink({ children }: { children: ReactNode }) {
  const active = usePathname() === "/profile";
  const t = useT("header");

  return (
    <Link
      href="/profile"
      aria-label={t("profile")}
      aria-current={active ? "page" : undefined}
      className={cn(
        "border-line-soft focus-visible:outline-primary flex h-11 w-11 items-center justify-center rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
        active
          ? "bg-panel text-primary-dark border-transparent"
          : "bg-surface text-ink-soft hover:bg-field-alt",
      )}
    >
      {children}
    </Link>
  );
}
