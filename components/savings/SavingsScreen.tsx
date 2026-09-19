"use client";

import { useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { saveOpeningSavings } from "@/app/actions/savings";
import { AppShell } from "@/components/app/AppShell";
import type { SaveState } from "@/components/budget/SaveStatus";
import { formatTaka } from "@/lib/finance/format";
import { buildSavingsView } from "@/lib/finance/savings";
import type { PastMonth } from "@/lib/finance/types";
import { OpeningSavingsCard } from "./OpeningSavingsCard";
import { SavingsHistory } from "./SavingsHistory";
import { SavingsSummary } from "./SavingsSummary";

type SavingsScreenProps = {
  openingSavings: number;
  history: PastMonth[];
  thisMonthSaving: number;
  monthLabel: string;
};

type OpeningForm = { opening: string };

export function SavingsScreen({
  openingSavings,
  history,
  thisMonthSaving,
  monthLabel,
}: SavingsScreenProps) {
  const { control, register, getValues } = useForm<OpeningForm>({
    defaultValues: { opening: String(openingSavings) },
  });

  const [state, setState] = useState<SaveState>("idle");
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(false);
  const [busy, startTransition] = useTransition();

  const opening = useWatch({ control, name: "opening" });
  const view = buildSavingsView(Number(opening) || 0, history, thisMonthSaving);

  const save = () => {
    setState("saving");
    setError("");

    startTransition(async () => {
      const result = await saveOpeningSavings(getValues("opening"));

      if (result.error) {
        setError(result.error);
        setState("error");
        return;
      }

      setDirty(false);
      setState("saved");
    });
  };

  const field = register("opening", {
    onChange: () => {
      setDirty(true);
      setState("idle");
      setError("");
    },
  });

  return (
    <AppShell
      title="জমানো টাকা"
      monthLabel={monthLabel}
      savingsLabel={formatTaka(view.total)}
    >
      <SavingsSummary view={view} />
      <OpeningSavingsCard
        field={field}
        dirty={dirty}
        busy={busy}
        state={state}
        error={error}
        onSave={save}
      />
      <SavingsHistory months={view.months} />
    </AppShell>
  );
}
