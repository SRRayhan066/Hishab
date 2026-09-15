import { Card } from "@/components/ui/Card";
import { formatTaka } from "@/lib/finance/format";
import type { MonthResult } from "@/lib/finance/history";

const toneInk: Record<MonthResult["tone"], string> = {
  good: "var(--color-primary)",
  over: "var(--color-over)",
};

export function PastMonths({ months }: { months: MonthResult[] }) {
  return (
    <Card className="px-[22px] pt-6 pb-[26px]">
      <h2 className="font-display text-[19px] font-bold">আগের মাসগুলো</h2>
      <p className="text-ink-muted mt-[3px] text-[15px]">
        সবুজ মানে বেঁচেছে, লাল মানে বাজেটের বাইরে গেছে।
      </p>

      {months.length === 0 ? (
        <p className="text-ink-faint pt-4 text-[15px]">
          আগের কোনো মাসের হিসাব এখনো নেই।
        </p>
      ) : (
        <ul className="mt-2">
          {months.map((month) => (
            <li
              key={month.month}
              className="flex items-center gap-3.5 border-b-[1.5px] border-[#f4f0e7] py-4 last:border-b-0"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[17px] font-semibold">{month.month}</p>
                <p className="text-ink-muted mt-0.5 text-[14px]">
                  খরচ {formatTaka(month.spent)} · সীমা{" "}
                  {formatTaka(month.budget)}
                </p>
              </div>

              <div className="flex-none text-right">
                <p
                  className="font-display text-[19px] font-bold"
                  style={{ color: toneInk[month.tone] }}
                >
                  {month.label}
                </p>
                <p className="text-ink-muted text-[14px]">{month.word}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
