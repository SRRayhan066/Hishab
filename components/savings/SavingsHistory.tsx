import { Card } from "@/components/ui/Card";
import { formatTaka } from "@/lib/finance/format";
import type { MonthResult } from "@/lib/finance/history";

const toneInk: Record<MonthResult["tone"], string> = {
  good: "var(--color-primary)",
  over: "var(--color-over)",
};

export function SavingsHistory({ months }: { months: MonthResult[] }) {
  return (
    <Card className="px-[22px] pt-[22px] pb-4">
      <h2 className="font-display text-[18px] font-bold">
        মাসে মাসে জমার হিসাব
      </h2>

      {months.length === 0 ? (
        <p className="text-ink-faint pt-3.5 pb-3 text-[15px]">
          আগের মাসের কোনো হিসাব এখনো নেই।
        </p>
      ) : (
        <ul className="mt-1">
          {months.map((month) => (
            <li
              key={month.month}
              className="flex items-center gap-3 border-b-[1.5px] border-[#f4f0e7] py-3.5 last:border-b-0"
            >
              <span className="w-[84px] flex-none text-[16px] font-semibold">
                {month.month}
              </span>

              <div className="h-[10px] min-w-[40px] flex-1 rounded-full bg-[#f2eee5]">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${month.percent}%`,
                    background: toneInk[month.tone],
                  }}
                />
              </div>

              <span
                className="font-display w-[92px] flex-none text-right text-[16px] font-bold"
                style={{ color: toneInk[month.tone] }}
                aria-label={`${month.month} মাসে ${formatTaka(Math.abs(month.amount))} ${month.word}`}
              >
                {month.label}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
