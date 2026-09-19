"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { saveCategorySection } from "@/app/actions/budget";
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
  toIncomeFields,
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
  categories: saveCategorySection,
};

export function BudgetScreen({
  initialData,
  monthName,
  daysInMonth,
}: BudgetScreenProps) {
  const { control, register, getValues } = useForm<PlanFormValues>({
    defaultValues: {
      income: toIncomeFields(initialData.income),
      categories: toCategoryFields(initialData.categories),
    },
  });

  // `id` is our own database id, so the array's React key lives on `key`.
  const income = useFieldArray({ control, name: "income", keyName: "key" });
  const categories = useFieldArray({
    control,
    name: "categories",
    keyName: "key",
  });

  const [status, setStatus] = useState<Record<PlanSectionName, SectionState>>({
    income: idle,
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
  const plannedTotal = fieldsTotal(watched.categories);

  const plan = useMemo(
    () => buildBudgetPlan(incomeTotal, plannedTotal, daysInMonth),
    [incomeTotal, plannedTotal, daysInMonth],
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
    () => spentByCategory(initialData.categories),
    [initialData.categories],
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
                note: `এ মাসে এরই মধ্যে ${formatTaka(alreadySpent)} খরচ হয়ে গেছে, বাজেটের চেয়ে ${formatTaka(alreadySpent - budget)} বেশি।`,
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

      <BudgetSection
        name="income"
        title="যা আসে"
        hint="বেতন, টিউশন, ভাড়া — যেখান থেকেই আসুক। পরের মাসেও এগুলো আপনা-আপনি বসে যাবে, আবার লিখতে হবে না।"
        fields={income.fields}
        notes={{}}
        register={register}
        remove={income.remove}
        namePlaceholder="আয়ের নাম"
        emptyLabel="এখনো কোনো আয় যোগ করোনি।"
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
        name="categories"
        title="মাসের খরচের পরিকল্পনা"
        hint="বাসা ভাড়া, বাজার, যাওয়া-আসা — সব খাত এখানে। এটা শুধু পরিকল্পনা; খরচ লিখলে তবেই টাকা কাটবে।"
        fields={categories.fields}
        notes={categoryNotes}
        register={register}
        remove={categories.remove}
        namePlaceholder="খাতের নাম"
        emptyLabel="এখনো কোনো খরচের খাত যোগ করোনি।"
        addLabel="খরচের খাত যোগ করো"
        totalLabel="মোট বাজেট"
        total={plannedTotal}
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
