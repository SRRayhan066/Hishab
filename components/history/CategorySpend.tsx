import { Card } from "@/components/ui/Card";
import { getFormat, getT } from "@/lib/i18n/server";
import type { CategoryStat } from "@/lib/finance/types";

const barColor: Record<CategoryStat["tone"], string> = {
  good: "var(--color-fixed)",
  warning: "var(--color-warn)",
  over: "var(--color-over)",
};

export async function CategorySpend({ categories }: { categories: CategoryStat[] }) {
  const [t, format] = await Promise.all([getT("history"), getFormat()]);

  return (
    <Card className="px-[22px] pt-6 pb-[26px]">
      <h2 className="font-display text-[19px] font-bold">
        {t("categoryTitle")}
      </h2>

      {categories.length === 0 ? (
        <p className="text-ink-faint pt-4 text-[15px]">
          {t("categoryEmpty")}
        </p>
      ) : (
        <ul className="mt-2">
          {categories.map((category) => (
            <li
              key={category.id}
              className="flex items-center gap-3.5 border-b-[1.5px] border-[#f4f0e7] py-[13px] last:border-b-0"
            >
              <span className="min-w-0 flex-1 text-[16px] font-semibold">
                {category.name}
              </span>

              <div className="h-[10px] w-[26%] max-w-[190px] min-w-[48px] flex-none rounded-full bg-[#f2eee5] sm:w-[34%]">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${category.percent}%`,
                    background: barColor[category.tone],
                  }}
                />
              </div>

              <span className="w-[80px] flex-none text-right text-[16px] font-semibold sm:w-[92px]">
                {format.taka(category.spent)}
                <span className="sr-only"> — {category.detail}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
