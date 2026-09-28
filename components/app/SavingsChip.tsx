"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PiggyBank } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useT } from "@/lib/i18n/client";

// The accounts screen already shows this figure large; a link to the page you
// are on is just noise. The placeholder has to make the same call, or the
// accounts screen flashes a chip-shaped gap that nothing ever fills.
function useHidden() {
  return usePathname() === "/accounts";
}

/** Stands in for the chip while the month's figures are still loading. */
export function SavingsChipFallback() {
  const hidden = useHidden();
  if (hidden) return null;

  return <Skeleton className="h-11 w-[104px] sm:w-[150px]" />;
}

export function SavingsChip({ label }: { label: string }) {
  const hidden = useHidden();
  const t = useT("header");
  if (hidden) return null;

  return (
    <Link
      href="/accounts"
      aria-label={t("savingsLabel", { amount: label })}
      className="bg-surface border-line-soft text-ink-soft hover:bg-field-alt focus-visible:outline-primary flex min-h-11 items-center gap-1.5 rounded-full border px-3.5 text-[14px] font-semibold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      <PiggyBank className="text-primary h-4 w-4 flex-none" />
      <span className="hidden sm:inline">{t("savings")}</span>
      {label}
    </Link>
  );
}
