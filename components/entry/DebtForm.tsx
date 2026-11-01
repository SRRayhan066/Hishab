"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { addDebtEntry } from "@/app/actions/debts";
import { accountEffect, isMoneyOut, isRepayment, netEffect, type DebtKind } from "@/lib/finance/debts";
import { useFormat, useT } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";
import { DirectionIcon, PersonBadge } from "@/components/debts/PersonBadge";
import {
  AccountChips,
  AmountField,
  ChipGroup,
  DayField,
  FormFoot,
  Preview,
  amountValue,
  chipClass,
  dashedChip,
  fieldLabel,
  pendingAdd,
  pendingBox,
  pendingCancel,
  pendingInput,
  type FormProps,
  type PreviewLine,
} from "./fields";

const kinds = [
  { kind: "lend", label: "lend", sub: "lendSub" },
  { kind: "borrow", label: "borrow", sub: "borrowSub" },
  { kind: "gotBack", label: "gotBack", sub: "gotBackSub" },
  { kind: "paidBack", label: "paidBack", sub: "paidBackSub" },
] as const;

const NEW_PERSON = "new";

type DebtFormProps = FormProps & {
  presetKind?: DebtKind;
  presetPersonId?: string;
};

export function DebtForm({
  context,
  amount,
  onAmount,
  onDone,
  presetKind,
  presetPersonId,
}: DebtFormProps) {
  const t = useT("entry");
  const common = useT("common");
  const errors = useT("errors");
  const format = useFormat();
  const { accounts, people, today, period } = context;

  const [kind, setKind] = useState<DebtKind>(presetKind ?? "lend");
  const [picked, setPicked] = useState(presetPersonId ?? "");
  const [newName, setNewName] = useState("");
  const [draftName, setDraftName] = useState<string | null>(null);
  const [accountId, setAccountId] = useState(
    context.lastAccountId ?? accounts[0]?.id ?? "",
  );
  const [note, setNote] = useState("");
  const [day, setDay] = useState(today);
  const [error, setError] = useState("");
  const [busy, startTransition] = useTransition();

  const options = people.filter((person) =>
    kind === "gotBack"
      ? person.net > 0
      : kind === "paidBack"
        ? person.net < 0
        : true,
  );
  const usingNew = picked === NEW_PERSON && newName !== "";
  const person = usingNew
    ? undefined
    : (options.find((item) => item.id === picked) ?? options[0]);
  const personName = usingNew ? newName : person?.name;
  const hasPerson = usingNew || person !== undefined;
  const net = person?.net ?? 0;
  const account = accounts.find((item) => item.id === accountId) ?? accounts[0];
  const value = amountValue(amount);
  const out = isMoneyOut(kind);

  const netText = (balance: number) =>
    balance > 0
      ? t("owesYou", { amount: format.taka(balance) })
      : balance < 0
        ? t("youOwe", { amount: format.taka(-balance) })
        : t("settled");

  const limitError = () => {
    if (!account) return "";
    if (out && value > account.balance) {
      return t("overdraw", {
        name: account.name,
        balance: format.taka(account.balance),
      });
    }
    if (kind === "paidBack" && person && value > -net) {
      return errors("debtPaidBackTooMuch", {
        name: person.name,
        amount: format.taka(-net),
      });
    }
    if (kind === "gotBack" && person && value > net) {
      return errors("debtGotBackTooMuch", {
        name: person.name,
        amount: format.taka(net),
      });
    }
    return "";
  };
  const limit = limitError();

  const preview: PreviewLine[] = [];
  if (value > 0 && personName && account) {
    const after = net + netEffect(kind, value);
    preview.push(
      {
        label: personName,
        before: netText(net),
        after: netText(after),
        color: after < 0 ? "#8f4a33" : "var(--color-primary-dark)",
      },
      {
        label: account.name,
        before: format.taka(account.balance),
        after: format.taka(account.balance + accountEffect(kind, value)),
      },
    );
  }

  const pickKind = (next: DebtKind) => {
    setKind(next);
    setError("");
    if (isRepayment(next)) {
      if (picked === NEW_PERSON) setPicked("");
      setDraftName(null);
    }
  };

  const confirmNewName = () => {
    const name = draftName?.trim() ?? "";
    if (!name) return;

    const existing = people.find(
      (item) => item.name.toLocaleLowerCase() === name.toLocaleLowerCase(),
    );
    setDraftName(null);
    if (existing) {
      setPicked(existing.id);
      return;
    }
    setNewName(name);
    setPicked(NEW_PERSON);
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (value <= 0 || limit || !hasPerson || !account) return;

    setError("");
    startTransition(async () => {
      const result = await addDebtEntry({
        kind,
        personId: usingNew ? undefined : person?.id,
        personName: usingNew ? newName : undefined,
        accountId: account.id,
        day,
        amount,
        note: note || undefined,
      });
      if (result.error) {
        setError(result.error);
        return;
      }
      onDone();
    });
  };

  return (
    <form
      onSubmit={submit}
      noValidate
      className="grid grid-cols-[minmax(0,1fr)] gap-[18px]"
    >
      <div className="grid gap-2">
        <span className={fieldLabel}>{t("what")}</span>
        <div className="grid grid-cols-2 gap-2">
          {kinds.map((item) => {
            const on = item.kind === kind;

            return (
              <button
                key={item.kind}
                type="button"
                aria-pressed={on}
                onClick={() => pickKind(item.kind)}
                className={cn(
                  "focus-visible:outline-primary flex min-h-14 min-w-0 cursor-pointer items-center gap-2.5 rounded-[14px] border-[1.5px] px-2.5 py-2 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
                  on ? "bg-panel border-primary" : "bg-field border-line",
                )}
              >
                <DirectionIcon out={isMoneyOut(item.kind)} className="h-[30px] w-[30px] rounded-[9px]" />
                <span className="grid min-w-0">
                  <span className="text-[15px] font-semibold">{t(item.label)}</span>
                  <span className="text-ink-soft text-[13px]">{t(item.sub)}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <AmountField
        amount={amount}
        onAmount={onAmount}
        invalid={limit !== ""}
      />

      <div className="grid gap-2">
        <ChipGroup label={t("withWhom")}>
          {options.map((item) => {
            const on = item.id === person?.id;

            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={on}
                onClick={() => setPicked(item.id)}
                className={cn(chipClass(on), "gap-2 pl-1.5")}
              >
                <PersonBadge name={item.name} owing={item.net < 0} className="h-8 w-8 text-[15px]" />
                {item.name}
              </button>
            );
          })}
          {newName !== "" && !isRepayment(kind) && (
            <button
              type="button"
              aria-pressed={usingNew}
              onClick={() => setPicked(NEW_PERSON)}
              className={cn(chipClass(usingNew), "gap-2 pl-1.5")}
            >
              <PersonBadge name={newName} owing={false} className="h-8 w-8 text-[15px]" />
              {newName}
            </button>
          )}
          {draftName === null && !isRepayment(kind) && (
            <button
              type="button"
              onClick={() => setDraftName("")}
              className={dashedChip}
            >
              <Plus className="h-[18px] w-[18px]" />
              {t("someoneNew")}
            </button>
          )}
        </ChipGroup>

        {isRepayment(kind) && options.length === 0 && (
          <span className="text-ink-soft text-[14px]">
            {t(kind === "gotBack" ? "nobodyOwes" : "nobodyOwed")}
          </span>
        )}

        {draftName !== null && (
          <div className={pendingBox}>
            <input
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  confirmNewName();
                }
              }}
              maxLength={60}
              autoFocus
              placeholder={t("theirName")}
              aria-label={t("theirName")}
              className={pendingInput}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={confirmNewName}
                disabled={!draftName.trim()}
                className={pendingAdd}
              >
                {common("add")}
              </button>
              <button
                type="button"
                onClick={() => setDraftName(null)}
                className={pendingCancel}
              >
                {common("cancel")}
              </button>
            </div>
          </div>
        )}
      </div>

      <AccountChips
        label={t(out ? "paidFrom" : "receivedInto")}
        accounts={accounts}
        selected={account?.id ?? ""}
        onSelect={setAccountId}
      />

      <DayField period={period} today={today} day={day} onChange={setDay} />

      <label className="grid grid-cols-[minmax(0,1fr)] gap-1.5">
        <span className={fieldLabel}>{t("note")}</span>
        <input
          value={note}
          onChange={(event) => setNote(event.target.value)}
          maxLength={120}
          placeholder={t("notePlaceholder")}
          className="bg-field border-line rounded-field text-ink placeholder:text-ink-muted focus:border-primary h-[46px] w-full min-w-0 border px-3.5 text-[15px] outline-none"
        />
      </label>

      {preview.length > 0 && <Preview lines={preview} />}

      <FormFoot
        error={error || limit}
        disabled={value <= 0 || limit !== "" || !hasPerson}
        busy={busy}
        label={t("submitDebt")}
        footnote={t("debtFootnote")}
      />
    </form>
  );
}
