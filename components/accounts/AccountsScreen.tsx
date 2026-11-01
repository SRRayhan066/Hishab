"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { saveAccountSection } from "@/app/actions/accounts";
import { DirtyBar } from "@/components/app/DirtyBar";
import { Card } from "@/components/ui/Card";
import { FormError } from "@/components/ui/FormError";
import {
  balanceWithOpening,
  keepsHistory,
  openingChanges,
  overdrawnAccount,
} from "@/lib/finance/accounts";
import { buildSavingsResults } from "@/lib/finance/history";
import type {
  BalanceAdjustmentEntry,
  MoneyAccount,
  PastMonth,
  TransferEntry,
} from "@/lib/finance/types";
import { useFormat, useT } from "@/lib/i18n/client";
import { AccountCard } from "./AccountCard";
import { AddAccountSheet } from "./AddAccountSheet";
import { CorrectionList } from "./CorrectionList";
import { CorrectionSheet } from "./CorrectionSheet";
import { SavingsHistory } from "./SavingsHistory";
import { TransferPanel } from "./TransferPanel";

export type AccountField = {
  id: string;
  name: string;
  amount: string;
  color: string;
  icon: string;
};

export type AccountFormValues = { accounts: AccountField[] };

type AccountsScreenProps = {
  accounts: MoneyAccount[];
  transfers: TransferEntry[];
  adjustments: BalanceAdjustmentEntry[];
  history: PastMonth[];
  balanceChange: number;
  remainingPlanned: number;
  monthName: string;
  readOnly: boolean;
};

const toFields = (accounts: MoneyAccount[]): AccountField[] =>
  accounts.map((account) => ({
    id: account.id,
    name: account.name,
    amount: String(account.openingBalance),
    color: account.color,
    icon: account.icon,
  }));

const changedRows = (
  saved: (Partial<AccountField> | undefined)[] | undefined,
  rows: AccountField[],
) => {
  const before = new Map((saved ?? []).map((row) => [row?.id, row]));
  const edited = rows.filter((row) => {
    const original = before.get(row.id);
    return original?.name !== row.name || original?.amount !== row.amount;
  });
  const kept = new Set(rows.map((row) => row.id));
  return (
    edited.length + (saved ?? []).filter((row) => !kept.has(row?.id ?? "")).length
  );
};

export function AccountsScreen({
  accounts,
  transfers,
  adjustments,
  history,
  balanceChange,
  remainingPlanned,
  monthName,
  readOnly,
}: AccountsScreenProps) {
  const t = useT("accounts");
  const errorsT = useT("errors");
  const format = useFormat();
  const { control, register, getValues, reset, formState } =
    useForm<AccountFormValues>({
      defaultValues: { accounts: toFields(accounts) },
    });
  const list = useFieldArray({ control, name: "accounts", keyName: "key" });

  const [error, setError] = useState("");
  const [correcting, setCorrecting] = useState("");
  const [adding, setAdding] = useState(false);
  const [busy, startTransition] = useTransition();
  const dirty = formState.isDirty;

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
  const total = balances.reduce((sum, balance) => sum + balance, 0);
  const planned = total - remainingPlanned;
  const correctingAccount = byId.get(correcting);
  const months = useMemo(() => buildSavingsResults(history), [history]);
  const gaining = balanceChange >= 0;

  const edited = () => setError("");

  const save = () => {
    const openings = getValues("accounts").map((row) => ({
      id: row.id,
      amount: Math.round(Number(row.amount)) || 0,
    }));
    const overdrawn = overdrawnAccount(
      accounts,
      openingChanges(accounts, openings),
    );
    if (overdrawn) {
      setError(errorsT("balanceBelowZero", { name: overdrawn.name }));
      return;
    }

    setError("");
    startTransition(async () => {
      const result = await saveAccountSection(getValues("accounts"));
      if (result.rows) {
        reset({
          accounts: result.rows.map((row) => ({
            ...row,
            color: row.color ?? "sage",
            icon: row.icon ?? "wallet",
          })),
        });
      }
      if (result.error) setError(result.error);
    });
  };

  return (
    <>
      <Card className="grid grid-cols-[minmax(0,1fr)] items-end gap-[18px] p-5 md:p-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <div className="grid gap-1.5">
          <p className="text-ink-soft text-[15px] font-medium">
            {readOnly
              ? t("totalLabelPast", { month: monthName })
              : t("totalLabel")}
          </p>
          <p className="font-display text-[50px] leading-[1.05] font-bold tracking-[-0.02em] md:text-[64px]">
            {format.taka(total)}
          </p>
          <p className="text-ink-soft mt-1 text-[16px] leading-[1.55] text-pretty">
            {readOnly
              ? t("sentencePast", { month: monthName })
              : planned >= 0
                ? t("sentence", { amount: format.taka(planned) })
                : t("sentenceShort", { amount: format.taka(-planned) })}
          </p>
        </div>
        <dl className="grid grid-cols-2 gap-3">
          <div className="bg-field grid gap-1 rounded-[16px] px-4 py-3.5">
            <dt className="text-ink-soft text-[14px]">{t("startOfMonth")}</dt>
            <dd className="font-display text-[22px] font-bold">
              {format.taka(total - balanceChange)}
            </dd>
          </div>
          <div
            className={`grid gap-1 rounded-[16px] px-4 py-3.5 ${
              gaining ? "bg-panel" : "bg-danger-bg"
            }`}
          >
            <dt className={`text-[14px] ${gaining ? "text-ink-panel" : "text-danger-ink"}`}>
              {readOnly ? t("monthNet", { month: monthName }) : t("thisMonth")}
            </dt>
            <dd
              className={`font-display text-[22px] font-bold ${
                gaining ? "text-primary-dark" : "text-danger-ink"
              }`}
            >
              {format.signedTaka(balanceChange)}
            </dd>
          </div>
        </dl>
      </Card>

      <FormError message={error} />

      <ul className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.fields.map((field, index) => {
          const account = byId.get(field.id);

          return (
            <AccountCard
              key={field.key}
              index={index}
              color={field.color}
              icon={field.icon}
              balance={balances[index] ?? 0}
              removable={
                !readOnly &&
                list.fields.length > 1 &&
                !(account && keepsHistory(account))
              }
              correctable={!readOnly && account !== undefined}
              openingFixed={account?.openingLocked ?? false}
              readOnly={readOnly}
              dirty={dirty}
              busy={busy}
              register={register}
              nameRef={() => {}}
              onRemove={() => {
                list.remove(index);
                edited();
              }}
              onEdit={edited}
              onCorrect={() => setCorrecting(field.id)}
            />
          );
        })}

        {!readOnly && (
          <li className="col-span-full">
            <button
              type="button"
              onClick={() => setAdding(true)}
              disabled={dirty}
              title={dirty ? t("saveFirst") : undefined}
              className="text-ink-soft hover:border-line-strong hover:text-ink focus-visible:outline-primary h-[46px] w-full cursor-pointer rounded-[13px] border border-dashed border-[#d8d2c4] text-[15px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              + {t("addAccount")}
            </button>
          </li>
        )}
      </ul>

      <CorrectionList
        accounts={accounts}
        adjustments={adjustments}
        monthName={monthName}
        readOnly={readOnly}
      />

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 md:grid-cols-2">
        <TransferPanel
          accounts={accounts}
          transfers={transfers}
          monthName={monthName}
          readOnly={readOnly}
        />
        <SavingsHistory months={months} />
      </div>

      {correctingAccount && (
        <CorrectionSheet
          key={correctingAccount.id}
          account={correctingAccount}
          onClose={() => setCorrecting("")}
        />
      )}
      {adding && (
        <AddAccountSheet
          used={accounts}
          onClose={() => setAdding(false)}
        />
      )}
      {dirty && !readOnly && (
        <DirtyBar
          count={Math.max(
            changedRows(formState.defaultValues?.accounts, getValues("accounts")),
            1,
          )}
          busy={busy}
          onDiscard={() => {
            reset();
            edited();
          }}
          onSave={save}
        />
      )}
    </>
  );
}
