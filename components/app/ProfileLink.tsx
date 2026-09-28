"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProfileLink() {
  const active = usePathname() === "/profile";

  return (
    <Link
      href="/profile"
      aria-label="প্রোফাইল"
      aria-current={active ? "page" : undefined}
      className={cn(
        "border-line-soft focus-visible:outline-primary flex h-11 w-11 items-center justify-center rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
        active
          ? "bg-panel text-primary-dark border-transparent"
          : "bg-surface text-ink-soft hover:bg-field-alt",
      )}
    >
      <UserRound className="h-5 w-5" />
    </Link>
  );
}
