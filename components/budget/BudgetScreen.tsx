"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import {
  saveCategorySection,
  saveFixedSection,
} from "@/app/actions/budget";
import { saveIncomeSection } from "@/app/actions/income";
import { formatTaka } from "@/lib/finance/format";
import { buildBudgetPlan } from "@/lib/finance/budget";
import type { MonthData } from "@/lib/finance/types";
import type { PlanRowValues, SectionSaveResult } from "@/types/finance";
import { BudgetSection, type RowNote } from "./BudgetSection";
import { PlanSummary } from "./PlanSummary";
import type { SaveState } from "./SaveStatus";
import {
  blankRow,
  fieldsTotal,
  spentByCategory,
  toCategoryFields,
  toRowFields,
  type PlanFormValues,
  type PlanRowField,
  type PlanSectionName,
} from "./plan-form";

type BudgetScreenProps = {
  initialData: MonthData;
  monthName: string;
  daysInMonth: number;
};

type SectionState = { state: SaveState; error: string; dirty: boolean };

const idle: SectionState = { state: "idle", error: "", dirty: false };

const savers: Record<
  PlanSectionName,
  (rows: PlanRowValues[]) => Promise<SectionSaveResult>
> = {
  income: saveIncomeSection,
  fixed: saveFixedSection,
  categories: saveCategorySection,
};

export function BudgetScreen({
  initialData,
  monthName,
  daysInMonth,
}: BudgetScreenProps) {
  const { control, register, getValues } = useForm<PlanFormValues>({
    defaultValues: {
      income: toRowFields(initialData.income),
      fixed: toRowFields(initialData.fixed),
      categories: toCategoryFields(initialData.variable),
    },
  });

  // `id` is our own database id, so the array's React key lives on `key`.
  const income = useFieldArray({ control, name: "income", keyName: "key" });
  const fixed = useFieldArray({ control, name: "fixed", keyName: "key" });
  const categories = useFieldArray({
    control,
    name: "categories",
    keyName: "key",
  });

  const [status, setStatus] = useState<Record<PlanSectionName, SectionState>>({
    income: idle,
    fixed: idle,
    categories: idle,
  });
  // Which section just gained a row, and where — so its name box takes focus.
  const [focus, setFocus] = useState<{
    section: PlanSectionName;
    index: number;
  } | null>(null);
  const [busy, startTransition] = useTransition();

  const watched = useWatch({ control });
  const incomeTotal = fieldsTotal(watched.income);
  const fixedTotal = fieldsTotal(watched.fixed);
  const variableBudget = fieldsTotal(watched.categories);

  const plan = useMemo(
    () => buildBudgetPlan(incomeTotal, fixedTotal, variableBudget, daysInMonth),
    [incomeTotal, fixedTotal, variableBudget, daysInMonth],
  );

  const unsaved = Object.values(status).some((section) => section.dirty);

  // Auto-save is gone, so the browser has to be the one to speak up.
  useEffect(() => {
    if (!unsaved) return;

    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [unsaved]);

  const patch = (name: PlanSectionName, next: Partial<SectionState>) =>
    setStatus((current) => ({
      ...current,
      [name]: { ...current[name], ...next },
    }));

  const markDirty = (name: PlanSectionName) =>
    patch(name, { dirty: true, state: "idle", error: "" });

  const save = (
    name: PlanSectionName,
    replace: (rows: PlanRowField[]) => void,
  ) => {
    const rows = getValues(name);
    patch(name, { state: "saving", error: "" });

    startTransition(async () => {
      const result = await savers[name](rows);

      if (result.error) {
        // A refused save sends the untouched rows back, so the form stops
        // showing a change the database never accepted.
        if (result.rows) {
          replace(result.rows);
          patch(name, { state: "error", error: result.error, dirty: false });
          return;
        }

        patch(name, { state: "error", error: result.error });
        return;
      }

      // The server sends the section back with real ids on the rows it just
      // created, and without the blank ones it dropped. Without this, saving
      // twice would create every new row a second time.
      if (result.rows) replace(result.rows);

      setFocus(null);
      patch(name, { state: "saved", error: "", dirty: false });
    });
  };

  const addRow = (
    append: (row: PlanRowField) => void,
    name: PlanSectionName,
  ) => {
    setFocus({ section: name, index: getValues(name).length });
    append(blankRow());
    markDirty(name);
  };

  const focusIndex = (name: PlanSectionName) =>
    focus?.section === name ? focus.index : null;

  const spent = useMemo(
    () => spentByCategory(initialData.variable),
    [initialData.variable],
  );

  const categoryNotes: Record<string, RowNote> = useMemo(() => {
    const rows = watched.categories ?? [];

    return Object.fromEntries(
      rows
        .filter((row) => row?.id)
        .map((row) => {
          const id = row.id as string;
          const alreadySpent = spent[id] ?? 0;
          const budget = Number(row.amount) || 0;

          if (alreadySpent > budget) {
            return [
              id,
              {
                note: `এই মাসে এখনই ${formatTaka(alreadySpent)} খরচ হয়ে গেছে — সীমার চেয়ে ${formatTaka(alreadySpent - budget)} বেশি।`,
                noteTone: "warn",
              } satisfies RowNote,
            ];
          }

          return [
            id,
            {
              note:
                alreadySpent > 0
                  ? `এই মাসে এ পর্যন্ত ${formatTaka(alreadySpent)} খরচ হয়েছে।`
                  : undefined,
              noteTone: "muted",
            } satisfies RowNote,
          ];
        }),
    );
  }, [watched.categories, spent]);

  return (
    <div className="flex flex-col gap-4">
      <PlanSummary plan={plan} monthName={monthName} />

      <div className="grid items-start gap-4 [grid-template-columns:repeat(auto-fit,minmax(320px,1fr))]">
        <BudgetSection
          name="income"
          title="যা আসে"
          hint="বেতন, টিউশন, ভাড়া — যেখান থেকেই আসুক। পরের মাসে এগুলো নিজে নিজেই চলে আসবে।"
          fields={income.fields}
          notes={{}}
          register={register}
          remove={income.remove}
          namePlaceholder="আয়ের নাম"
          emptyLabel="এখনো কোনো আয়ের খাত লেখা হয়নি।"
          addLabel="আয়ের খাত যোগ করো"
          totalLabel="মোট আয়"
          total={incomeTotal}
          accent
          focusIndex={focusIndex("income")}
          dirty={status.income.dirty}
          busy={busy}
          state={status.income.state}
          error={status.income.error}
          onAdd={() => addRow(income.append, "income")}
          onSave={() => save("income", income.replace)}
          onDirty={() => markDirty("income")}
        />

        <BudgetSection
          name="fixed"
          title="যা প্রতি মাসেই যায়"
          hint="পরিবারকে পাঠানো, বাসা ভাড়া, রান্নার আপা, বিল।"
          fields={fixed.fields}
          notes={{}}
          register={register}
          remove={fixed.remove}
          namePlaceholder="খরচের নাম"
          emptyLabel="এখনো কোনো বাঁধা খরচ লেখা হয়নি।"
          addLabel="বাঁধা খরচ যোগ করো"
          totalLabel="মোট বাঁধা খরচ"
          total={fixedTotal}
          focusIndex={focusIndex("fixed")}
          dirty={status.fixed.dirty}
          busy={busy}
          state={status.fixed.state}
          error={status.fixed.error}
          onAdd={() => addRow(fixed.append, "fixed")}
          onSave={() => save("fixed", fixed.replace)}
          onDirty={() => markDirty("fixed")}
        />
      </div>

      <BudgetSection
        name="categories"
        title="হাতখরচের ভাগ"
        hint="প্রতি খাতে এই মাসে সর্বোচ্চ কত খরচ করবে।"
        fields={categories.fields}
        notes={categoryNotes}
        register={register}
        remove={categories.remove}
        namePlaceholder="খাতের নাম"
        emptyLabel="এখনো কোনো খাত লেখা হয়নি।"
        addLabel="খাত যোগ করো"
        totalLabel="মোট হাতখরচ"
        total={variableBudget}
        focusIndex={focusIndex("categories")}
        dirty={status.categories.dirty}
        busy={busy}
        state={status.categories.state}
        error={status.categories.error}
        onAdd={() => addRow(categories.append, "categories")}
        onSave={() => save("categories", categories.replace)}
        onDirty={() => markDirty("categories")}
      />
    </div>
  );
}
