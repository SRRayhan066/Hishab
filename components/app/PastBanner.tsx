"use client";

import { useTransition } from "react";
import { Lock } from "lucide-react";
import { viewMonth } from "@/app/actions/month";
import { useFormat, useT } from "@/lib/i18n/client";

export function PastBanner({
  monthIndex,
  year,
  currentMonthIndex,
}: {
  monthIndex: number;
  year: number;
  currentMonthIndex: number;
}) {
  const t = useT("header");
  const format = useFormat();
  const [busy, startTransition] = useTransition();

  return (
    <div className="bg-field-alt text-ink-soft flex flex-wrap items-center justify-between gap-3 rounded-[16px] px-4 py-3 text-[14px]">
      <span className="flex items-center gap-2">
        <Lock className="h-[18px] w-[18px] flex-none" />
        {t("pastBanner", {
          month: format.month(monthIndex),
          year: format.digits(year),
        })}
      </span>
      <button
        type="button"
        disabled={busy}
        onClick={() => startTransition(() => viewMonth(null))}
        className="bg-surface text-primary-dark focus-visible:outline-primary h-9 cursor-pointer rounded-[10px] px-3 text-[14px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-wait"
      >
        {t("backTo", { month: format.month(currentMonthIndex) })}
      </button>
    </div>
  );
}
