import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useT } from "@/lib/i18n/client";

export function HistoryLink() {
  const t = useT("budget");

  return (
    <Link
      href="/history"
      className="bg-surface border-line-soft focus-visible:outline-primary flex items-center justify-between gap-3 rounded-[18px] border px-[18px] py-4 focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      <span className="grid">
        <span className="text-[15px] font-semibold">{t("historyLink")}</span>
        <span className="text-ink-soft text-[13px]">{t("historyHint")}</span>
      </span>
      <ChevronRight className="text-ink-soft h-[22px] w-[22px] flex-none" />
    </Link>
  );
}
