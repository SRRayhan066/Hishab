"use client";

import { useEffect, useState, useTransition } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { saveAccountSection } from "@/app/actions/accounts";
import type { SaveState } from "@/components/budget/SaveStatus";
import { balanceWithOpening, buildSavingsView } from "@/lib/finance/accounts";
import { pickAccountStyle } from "@/lib/finance/account-style";
import type {
  MoneyAccount,
  PastMonth,
  TransferEntry,
} from "@/lib/finance/types";
import {
  AccountListCard,
  type AccountField,
  type AccountFormValues,
} from "./AccountListCard";
import { AccountsSummary } from "./AccountsSummary";
import { SavingsHistory } from "./SavingsHistory";
import { TransferCard } from "./TransferCard";
import { TransferList } from "./TransferList";

type AccountsScreenProps = {
  accounts: MoneyAccount[];
  transfers: TransferEntry[];
  history: PastMonth[];
  thisMonthNet: number;
  projectedNet: number;
  monthName: string;
  reference: { year: number; monthIndex: number; day: number };
};

const toFields = (accounts: MoneyAccount[]): AccountField[] =>
  accounts.map((account) => ({
    id: account.id,
    name: account.name,
    amount: String(account.openingBalance),
    color: account.color,
    icon: account.icon,
  }));

export function AccountsScreen({
  accounts,
  transfers,
  history,
  thisMonthNet,
  projectedNet,
  monthName,
  reference,
}: AccountsScreenProps) {
  const { control, register, getValues, reset, formState } = useForm<AccountFormValues>({
    defaultValues: { accounts: toFields(accounts) },
  });
  const list = useFieldArray({ control, name: "accounts", keyName: "key" });

  const [state, setState] = useState<SaveState>("idle");
  const [error, setError] = useState("");
  const dirty = formState.isDirty;
  const [focus, setFocus] = useState<number | null>(null);
  const [busy, startTransition] = useTransition();

  useEffect(() => {
    if (!dirty) return;

    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const rows = useWatch({ control, name: "accounts" }) ?? [];
  const byId = new Map(accounts.map((account) => [account.id, account]));
  const balances = rows.map((row) =>
    balanceWithOpening(
      row?.id ? byId.get(row.id) : undefined,
      Number(row?.amount) || 0,
    ),
  );
  const locked = list.fields.map((field) => byId.get(field.id)?.inUse ?? false);

  const view = buildSavingsView(
    rows.reduce((sum, row) => sum + (Number(row?.amount) || 0), 0),
    balances.reduce((sum, balance) => sum + balance, 0),
    history,
    thisMonthNet,
    projectedNet,
  );

  const edited = () => {
    if (state !== "error") return;
    setState("idle");
    setError("");
  };

  const add = () => {
    setFocus(getValues("accounts").length);
    list.append({
      id: "",
      name: "",
      amount: "",
      ...pickAccountStyle(getValues("accounts")),
    });
    edited();
  };

  const save = () => {
    setState("saving");
    setError("");

    startTransition(async () => {
      const result = await saveAccountSection(getValues("accounts"));

      if (result.rows) reset({ accounts: result.rows });

      if (result.error) {
        setError(result.error);
        setState("error");
        return;
      }

      setFocus(null);
      setState("saved");
    });
  };

  return (
    <>
      <AccountsSummary view={view} />
      <AccountListCard
        fields={list.fields}
        balances={balances}
        locked={locked}
        register={register}
        remove={list.remove}
        focusIndex={focus}
        dirty={dirty}
        busy={busy}
        state={state}
        error={error}
        onAdd={add}
        onSave={save}
        onEdit={edited}
      />
      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        <TransferCard accounts={accounts} reference={reference} />
        <TransferList
          accounts={accounts}
          transfers={transfers}
          monthName={monthName}
        />
      </div>
      <SavingsHistory months={view.months} />
    </>
  );
}
