"use client";

import { useState, useTransition } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import type { PlanRowValues, SectionSaveResult } from "@/types/finance";
import { countChanges, type PlanRowField, type PlanSectionValues } from "./plan-form";

export function usePlanSection(
  initialRows: PlanRowField[],
  saveRows: (rows: PlanRowValues[]) => Promise<SectionSaveResult>,
  newRow: () => PlanRowField,
  check?: (rows: PlanRowField[]) => string | undefined,
) {
  const { control, register, getValues, reset, formState } =
    useForm<PlanSectionValues>({ defaultValues: { rows: initialRows } });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "rows",
    keyName: "key",
  });
  const rows = useWatch({ control, name: "rows" });

  const [error, setError] = useState("");
  const [focusIndex, setFocusIndex] = useState<number | null>(null);
  const [busy, startTransition] = useTransition();

  const edited = () => setError("");

  const add = () => {
    setFocusIndex(getValues("rows").length);
    append(newRow());
    edited();
  };

  const removeRow = (index: number) => {
    remove(index);
    edited();
  };

  const save = () => {
    const problem = check?.(getValues("rows"));
    if (problem) {
      setError(problem);
      return;
    }

    setError("");

    startTransition(async () => {
      const result = await saveRows(getValues("rows"));

      if (result.rows) reset({ rows: result.rows });

      if (result.error) {
        setError(result.error);
        return;
      }

      setFocusIndex(null);
    });
  };

  const discard = () => {
    reset();
    setError("");
    setFocusIndex(null);
  };

  return {
    control,
    register,
    fields,
    rows,
    dirty: formState.isDirty,
    changes: countChanges(formState.defaultValues?.rows, rows),
    dirtyRows: formState.dirtyFields.rows,
    busy,
    error,
    focusIndex,
    add,
    removeRow,
    save,
    discard,
    edited,
  };
}

export type PlanSection = ReturnType<typeof usePlanSection>;
