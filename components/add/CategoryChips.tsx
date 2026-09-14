import { cn } from "@/lib/utils";
import type { CategoryStat } from "@/lib/finance/types";

type CategoryChipsProps = {
  categories: CategoryStat[];
  selected: string;
  onSelect: (id: string) => void;
};

export function CategoryChips({
  categories,
  selected,
  onSelect,
}: CategoryChipsProps) {
  return (
    <fieldset className="mt-[22px]">
      <legend className="text-ink-muted text-[15px] font-medium">
        কোন খাতে?
      </legend>

      <div className="mt-3 flex flex-wrap gap-2.5">
        {categories.map((category) => {
          const active = category.id === selected;

          return (
            <label
              key={category.id}
              className={cn(
                "has-[:focus-visible]:outline-primary flex min-h-[46px] cursor-pointer items-center rounded-full border-[1.5px] px-5 text-[15px] font-semibold transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2",
                active
                  ? "border-ink bg-ink text-white"
                  : "border-line bg-field text-ink hover:border-line-strong",
              )}
            >
              <input
                type="radio"
                name="category"
                value={category.id}
                checked={active}
                onChange={() => onSelect(category.id)}
                className="sr-only"
              />
              {category.name}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
