"use client";

import { useState, useTransition } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import type { PlanRowValues, SectionSaveResult } from "@/types/finance";
import type { SaveState } from "./SaveStatus";
import type { PlanRowField, PlanSectionValues } from "./plan-form";

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

  const [state, setState] = useState<SaveState>("idle");
  const [error, setError] = useState("");
  const [focusIndex, setFocusIndex] = useState<number | null>(null);
  const [busy, startTransition] = useTransition();

  const edited = () => {
    if (state !== "error") return;
    setState("idle");
    setError("");
  };

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
      setState("error");
      return;
    }

    setState("saving");
    setError("");

    startTransition(async () => {
      const result = await saveRows(getValues("rows"));

      if (result.rows) reset({ rows: result.rows });

      if (result.error) {
        setError(result.error);
        setState("error");
        return;
      }

      setFocusIndex(null);
      setState("saved");
    });
  };

  return {
    control,
    register,
    fields,
    rows,
    dirty: formState.isDirty,
    busy,
    state,
    error,
    focusIndex,
    add,
    removeRow,
    save,
    edited,
  };
}

export type PlanSection = ReturnType<typeof usePlanSection>;
