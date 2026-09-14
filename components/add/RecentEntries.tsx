"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { formatTaka } from "@/lib/finance/format";
import type { RecentEntry } from "@/lib/finance/entries";

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
  const visible = expanded ? entries : entries.slice(0, PAGE_SIZE);
  const hidden = entries.length - visible.length;

  return (
    <Card className="flex min-h-0 flex-col px-[22px] pt-[22px] pb-4">
      <h2 className="font-display text-[19px] font-bold">সর্বশেষ যোগ করা</h2>

      {entries.length === 0 ? (
        <p className="text-ink-faint pt-3.5 pb-5 text-[15px]">
          এই মাসে এখনো কিছু যোগ করা হয়নি।
        </p>
      ) : (
        <>
          <ul className={expanded ? "lg:max-h-[420px] lg:overflow-y-auto" : ""}>
            {visible.map((entry) => (
              <li
                key={entry.id}
                className="flex items-center gap-3 border-b-[1.5px] border-[#f4f0e7] py-[13px]"
              >
                <span className="text-ink-faint w-[62px] flex-none text-[14px] font-medium">
                  {entry.day} {monthName.slice(0, 4)}
                </span>
                <span className="min-w-0 flex-1 truncate text-[16px] font-semibold">
                  {entry.categoryName}
                </span>
                <span className="text-ink-soft text-[16px] font-semibold">
                  {formatTaka(entry.amount)}
                </span>
                <button
                  type="button"
                  onClick={() => onRemove(entry.id)}
                  aria-label={`${entry.categoryName} খাতের ${formatTaka(entry.amount)} খরচ মুছে ফেলো`}
                  className="text-line-strong hover:text-danger focus-visible:outline-primary cursor-pointer rounded-md py-1 pl-2.5 text-[19px] leading-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
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
              className="text-primary hover:text-primary-dark focus-visible:outline-primary mt-3.5 cursor-pointer self-start rounded-md text-[15px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {expanded ? "কম দেখাও" : `আরও ${hidden}টি দেখাও`}
            </button>
          )}
        </>
      )}
    </Card>
  );
}
