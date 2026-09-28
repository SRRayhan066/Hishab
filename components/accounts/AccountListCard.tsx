"use client";

import { useEffect, useRef } from "react";
import { Plus } from "lucide-react";
import type {
  FieldArrayWithId,
  UseFieldArrayRemove,
  UseFormRegister,
} from "react-hook-form";
import { SaveStatus, type SaveState } from "@/components/budget/SaveStatus";
import { Card } from "@/components/ui/Card";
import { useT } from "@/lib/i18n/client";
import { AccountCard } from "./AccountCard";

export type AccountField = {
  id: string;
  name: string;
  amount: string;
  color: string;
  icon: string;
};

export type AccountFormValues = { accounts: AccountField[] };

type AccountListCardProps = {
  fields: FieldArrayWithId<AccountFormValues, "accounts", "key">[];
  balances: number[];
  locked: boolean[];
  register: UseFormRegister<AccountFormValues>;
  remove: UseFieldArrayRemove;
  focusIndex: number | null;
  dirty: boolean;
  busy: boolean;
  state: SaveState;
  error: string;
  onAdd: () => void;
  onSave: () => void;
  onEdit: () => void;
};

export function AccountListCard({
  fields,
  balances,
  locked,
  register,
  remove,
  focusIndex,
  dirty,
  busy,
  state,
  error,
  onAdd,
  onSave,
  onEdit,
}: AccountListCardProps) {
  const t = useT("accounts");
  const common = useT("common");
  const nameRefs = useRef(new Map<number, HTMLInputElement | null>());

  useEffect(() => {
    if (focusIndex !== null) nameRefs.current.get(focusIndex)?.focus();
  }, [focusIndex, fields.length]);

  return (
    <Card
      data-tour="accountList"
      className="flex flex-col px-[22px] pt-[22px] pb-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="font-display text-[18px] font-bold">{t("listTitle")}</h2>
          <p className="text-ink-muted mt-0.5 max-w-[60ch] text-[14px] leading-[1.55]">
            {t("listHint")}
          </p>
        </div>
        <SaveStatus state={state} error={error} dirty={dirty} />
      </div>

      <ul className="mt-4 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {fields.map((field, index) => (
          <AccountCard
            key={field.key}
            index={index}
            color={field.color}
            icon={field.icon}
            balance={balances[index] ?? 0}
            removable={!locked[index] && fields.length > 1}
            busy={busy}
            register={register}
            nameRef={(node) => {
              nameRefs.current.set(index, node);
            }}
            onRemove={() => {
              remove(index);
              onEdit();
            }}
            onEdit={onEdit}
          />
        ))}

        <li>
          <button
            type="button"
            onClick={onAdd}
            className="text-ink-soft hover:border-line-strong hover:bg-field hover:text-ink focus-visible:outline-primary flex h-full min-h-[64px] w-full cursor-pointer items-center justify-center gap-2.5 rounded-[20px] sm:min-h-[172px] sm:flex-col border-[1.5px] border-dashed border-[#d8d2c4] px-4 text-[15px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <span className="bg-field-alt flex h-9 w-9 items-center justify-center rounded-full sm:h-11 sm:w-11">
              <Plus className="h-5 w-5" />
            </span>
            {t("addAccount")}
          </button>
        </li>
      </ul>

      <button
        type="button"
        onClick={onSave}
        disabled={busy || !dirty}
        className="bg-ink focus-visible:outline-primary mt-4 min-h-[46px] cursor-pointer rounded-[12px] px-4 text-[15px] font-bold text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {busy ? common("saving") : common("save")}
      </button>
    </Card>
  );
}
