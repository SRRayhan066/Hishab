"use client";

import { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CategoryStat } from "@/lib/finance/types";
import { useT } from "@/lib/i18n/client";

type CategoryChipsProps = {
  categories: CategoryStat[];
  selected: string;
  onSelect: (id: string) => void;
  onCreate: (name: string) => void;
  busy?: boolean;
};

export function CategoryChips({
  categories,
  selected,
  onSelect,
  onCreate,
  busy = false,
}: CategoryChipsProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);
  const t = useT("add");
  const errors = useT("errors");

  useEffect(() => {
    if (open) nameRef.current?.focus();
  }, [open]);

  const close = () => {
    setOpen(false);
    setName("");
    setError("");
  };

  const create = () => {
    const trimmed = name.trim();

    if (!trimmed) {
      setError(errors("categoryName"));
      return;
    }

    if (categories.some((item) => item.name === trimmed)) {
      setError(errors("categoryExists"));
      return;
    }

    onCreate(trimmed);
    close();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
      create();
    }
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    }
  };

  return (
    <fieldset className="mt-5">
      <legend className="text-ink-muted text-[15px] font-medium">
        {t("categoryLegend")}
      </legend>

      <div className="mt-2.5 flex flex-wrap gap-2">
        {categories.map((category) => {
          const active = category.id === selected;

          return (
            <label
              key={category.id}
              className={cn(
                "has-[:focus-visible]:outline-primary flex min-h-[46px] cursor-pointer items-center rounded-full border-[1.5px] px-4 text-[15px] font-semibold transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2",
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

        {!open && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="text-ink-soft hover:border-line-strong hover:text-ink focus-visible:outline-primary flex min-h-[46px] cursor-pointer items-center gap-1.5 rounded-full border-[1.5px] border-dashed border-[#d8d2c4] px-4 text-[15px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <Plus className="h-4 w-4" />
            {t("newCategory")}
          </button>
        )}
      </div>

      {open && (
        <div className="bg-field border-line @container mt-3 rounded-[14px] border p-[14px]">
          <div className="flex flex-col gap-2.5 @md:flex-row @md:items-end">
            <div className="flex min-w-0 flex-col gap-[7px] @md:flex-1">
              <label
                htmlFor="new-category-name"
                className="text-ink-soft text-[14px] font-semibold"
              >
                {t("categoryName")}
              </label>
              <input
                id="new-category-name"
                ref={nameRef}
                value={name}
                onChange={(event) => setName(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t("categoryPlaceholder")}
                className="bg-surface border-line rounded-field text-ink placeholder:text-ink-faint focus:border-primary min-h-[46px] border-[1.5px] px-[14px] text-[15px] outline-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={create}
                disabled={busy}
                className="bg-primary hover:bg-primary-dark focus-visible:outline-primary min-h-[46px] flex-1 cursor-pointer @md:flex-none rounded-[12px] px-4 text-[15px] font-bold text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t("addCategory")}
              </button>
              <button
                type="button"
                onClick={close}
                className="text-ink-soft hover:text-ink focus-visible:outline-primary min-h-[46px] cursor-pointer rounded-[12px] px-3 text-[15px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                {t("cancel")}
              </button>
            </div>
          </div>

          {error ? (
            <p role="alert" className="text-danger mt-2.5 text-[14px] font-medium">
              {error}
            </p>
          ) : (
            <p className="text-ink-faint mt-2.5 text-[14px]">
              {t("temporaryHint")}
            </p>
          )}
        </div>
      )}
    </fieldset>
  );
}
