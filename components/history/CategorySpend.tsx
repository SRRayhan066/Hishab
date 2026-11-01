import { Card } from "@/components/ui/Card";
import type { CategoryStat } from "@/lib/finance/types";
import { getFormat, getT } from "@/lib/i18n/server";

type CategorySpendProps = {
  categories: CategoryStat[];
  isPast: boolean;
  monthName: string;
};

export async function CategorySpend({
  categories,
  isPast,
  monthName,
}: CategorySpendProps) {
  const [t, format] = await Promise.all([getT("history"), getFormat()]);
  const largest = Math.max(...categories.map((item) => item.spent), 1);

  return (
    <Card className="grid grid-cols-[minmax(0,1fr)] gap-1 p-5 md:p-6">
      <h2 className="font-display mb-2.5 text-[19px] font-bold">
        {isPast
          ? t("categoryTitlePast", { month: monthName })
          : t("categoryTitle")}
      </h2>

      {categories.length === 0 ? (
        <p className="text-ink-soft text-[15px]">
          {isPast
            ? t("categoryEmptyPast", { month: monthName })
            : t("categoryEmpty")}
        </p>
      ) : (
        <ul>
          {categories.map((category) => (
            <li
              key={category.id}
              className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto] items-center gap-3 py-[9px]"
            >
              <span className="truncate text-[15px] font-medium">
                {category.name}
              </span>
              <div className="h-2.5 rounded-full bg-[#f2eee5]">
                <div
                  className="bg-fixed h-full rounded-full"
                  style={{ width: `${(category.spent / largest) * 100}%` }}
                />
              </div>
              <span className="font-display min-w-16 text-right text-[15px] font-bold">
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
