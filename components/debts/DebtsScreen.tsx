"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronRight,
  CircleCheck,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { DebtBook, DebtPersonView } from "@/lib/finance/debts";
import { useFormat, useT } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";
import { PersonBadge } from "./PersonBadge";
import { useDebtDate } from "./useDebtDate";

export function DebtsScreen({ book }: { book: DebtBook }) {
  const t = useT("debts");
  const format = useFormat();
  const { owed, owe, settled, owedTotal, oweTotal } = book;
  const difference = owedTotal - oweTotal;

  const peopleLabel = (
    count: number,
    many: "fromPeople" | "toPeople",
    one: "fromPeopleOne" | "toPeopleOne",
  ) =>
    count === 0
      ? t("nobody")
      : t(count === 1 ? one : many, { count: format.number(count) });

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-4">
      <Card className="grid gap-3.5 p-5 md:p-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-panel text-ink-panel grid gap-1 rounded-[16px] p-4">
            <span className="flex items-center gap-1.5 text-[14px] font-medium">
              <ArrowDownLeft className="h-[18px] w-[18px] flex-none" strokeWidth={2.4} />
              {t("owedToYou")}
            </span>
            <span className="font-display text-primary-dark text-[26px] font-bold tracking-[-0.01em] md:text-[34px]">
              {format.taka(owedTotal)}
            </span>
            <span className="text-[13px]">
              {peopleLabel(owed.length, "fromPeople", "fromPeopleOne")}
            </span>
          </div>
          <div className="grid gap-1 rounded-[16px] bg-[#fbf0ea] p-4 text-[#8f4a33]">
            <span className="flex items-center gap-1.5 text-[14px] font-medium">
              <ArrowUpRight className="h-[18px] w-[18px] flex-none" strokeWidth={2.4} />
              {t("youOwe")}
            </span>
            <span className="font-display text-[26px] font-bold tracking-[-0.01em] md:text-[34px]">
              {format.taka(oweTotal)}
            </span>
            <span className="text-[13px]">
              {peopleLabel(owe.length, "toPeople", "toPeopleOne")}
            </span>
          </div>
        </div>
        <p className="text-ink-soft text-[15px] leading-[1.55] text-pretty">
          {difference > 0
            ? t("sentenceMore", { amount: format.taka(difference) })
            : difference < 0
              ? t("sentenceLess", { amount: format.taka(-difference) })
              : t("sentenceEven")}
        </p>
      </Card>

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 md:grid-cols-2">
        <PersonList title={t("owedToYou")} people={owed} empty={t("noneOwed")} />
        <PersonList title={t("youOwe")} people={owe} empty={t("noneOwe")} />
      </div>

      {settled.length > 0 && <SettledPanel people={settled} />}
    </div>
  );
}

function PersonList({
  title,
  people,
  empty,
}: {
  title: string;
  people: DebtPersonView[];
  empty: string;
}) {
  return (
    <Card className="grid grid-cols-[minmax(0,1fr)] px-[18px] pt-[18px] pb-2 md:px-6 md:pt-[22px] md:pb-2.5">
      <h2 className="font-display mb-2 text-[19px] font-bold">{title}</h2>
      {people.length === 0 ? (
        <p className="text-ink-soft border-t border-[#f4f0e7] py-3 text-[15px]">
          {empty}
        </p>
      ) : (
        <ul>
          {people.map((person) => (
            <PersonRow key={person.id} person={person} />
          ))}
        </ul>
      )}
    </Card>
  );
}

function PersonRow({ person }: { person: DebtPersonView }) {
  const t = useT("debts");
  const format = useFormat();
  const date = useDebtDate();
  const lent = person.net > 0;
  const meta = [
    person.since && t("since", { date: date(person.since) }),
    person.done > 0 &&
      t(lent ? "paidBackMeta" : "repaidMeta", {
        amount: format.taka(person.done),
      }),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <li>
      <Link
        href={`/debts/${person.id}`}
        className="focus-visible:outline-primary flex items-center gap-3 border-t border-[#f4f0e7] py-3 focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <PersonBadge
          name={person.name}
          owing={!lent}
          className="h-[42px] w-[42px] text-[18px]"
        />
        <span className="grid min-w-0 flex-1">
          <span className="truncate text-[16px] font-semibold">{person.name}</span>
          <span className="text-ink-soft text-[13px]">{meta}</span>
        </span>
        <span
          className={cn(
            "font-display text-[17px] font-bold whitespace-nowrap",
            lent ? "text-primary-dark" : "text-[#8f4a33]",
          )}
        >
          {format.taka(Math.abs(person.net))}
        </span>
        <ChevronRight className="text-ink-muted h-5 w-5 flex-none" />
      </Link>
    </li>
  );
}

function SettledPanel({ people }: { people: DebtPersonView[] }) {
  const t = useT("debts");
  const common = useT("common");
  const format = useFormat();
  const date = useDebtDate();
  const [open, setOpen] = useState(false);
  const latest = people[0];

  return (
    <section className="rounded-[18px] border border-dashed border-[#d8d2c4] px-[18px] py-3.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-ink-soft flex items-center gap-2.5 text-[15px]">
          <CircleCheck className="text-primary h-5 w-5 flex-none" />
          {t("settledLine", {
            name: latest.name,
            amount: format.taka(latest.total),
            date: latest.last ? date(latest.last) : "",
          })}
        </span>
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="text-primary-dark focus-visible:outline-primary cursor-pointer rounded-md text-[14px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          {common(open ? "hide" : "show")}
        </button>
      </div>

      {open && (
        <ul className="mt-2">
          {people.map((person) => (
            <li key={person.id}>
              <Link
                href={`/debts/${person.id}`}
                className="focus-visible:outline-primary flex items-center gap-3 border-t border-[#f4f0e7] py-2.5 focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <PersonBadge
                  name={person.name}
                  owing={false}
                  className="h-9 w-9 text-[15px]"
                />
                <span className="grid min-w-0 flex-1">
                  <span className="truncate text-[15px] font-semibold">
                    {person.name}
                  </span>
                  <span className="text-ink-soft text-[13px]">
                    {t("settledRow", {
                      date: person.last ? date(person.last) : "",
                    })}
                  </span>
                </span>
                <span className="font-display text-[15px] font-bold">
                  {format.taka(person.total)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
