"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import type { RecentEntry } from "@/lib/finance/entries";
import { useFormat, useT } from "@/lib/i18n/client";

type RecentEntriesProps = {
  entries: RecentEntry[];
  monthName: string;
  onRemove: (id: string) => void;
};

const PAGE_SIZE = 8;

export function RecentEntries({
  entries,
  monthName,
  onRemove,
}: RecentEntriesProps) {
  const [expanded, setExpanded] = useState(false);
  const t = useT("add");
  const common = useT("common");
  const format = useFormat();
  const visible = expanded ? entries : entries.slice(0, PAGE_SIZE);
  const hidden = entries.length - visible.length;

  return (
    <Card className="flex min-h-0 flex-col px-[22px] pt-[22px] pb-4">
      <h2 className="font-display text-[19px] font-bold">{t("recentTitle")}</h2>

      {entries.length === 0 ? (
        <p className="text-ink-faint pt-3.5 pb-5 text-[15px]">
          {t("recentEmpty")}
        </p>
      ) : (
        <>
          <ul className={expanded ? "lg:max-h-[420px] lg:overflow-y-auto" : ""}>
            {visible.map((entry) => (
              <li
                key={entry.id}
                className="flex items-center gap-3 border-b-[1.5px] border-[#f4f0e7] py-2.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[16px] font-semibold">
                    {entry.categoryName}
                  </p>
                  <p className="text-ink-muted mt-px text-[14px]">
                    {common("dayMonth", {
                      day: format.digits(entry.day),
                      month: monthName,
                    })}
                    {entry.accountName && ` · ${entry.accountName}`}
                  </p>
                </div>
                <span className="text-ink-soft text-[16px] font-semibold">
                  {format.taka(entry.amount)}
                </span>
                <button
                  type="button"
                  onClick={() => onRemove(entry.id)}
                  aria-label={t("removeEntry", {
                    category: entry.categoryName,
                    amount: format.taka(entry.amount),
                  })}
                  className="text-line-strong hover:text-danger focus-visible:outline-primary -mr-2.5 flex h-11 w-11 flex-none cursor-pointer items-center justify-center rounded-[12px] text-[20px] leading-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>

          {(hidden > 0 || expanded) && (
            <button
              type="button"
              onClick={() => setExpanded((current) => !current)}
              className="text-primary hover:text-primary-dark focus-visible:outline-primary mt-1.5 min-h-[44px] cursor-pointer self-start rounded-md text-[15px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {expanded
                ? t("showLess")
                : t("showMore", { count: format.number(hidden) })}
            </button>
          )}
        </>
      )}
    </Card>
  );
}
