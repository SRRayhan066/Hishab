import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";
import { buildDebtBook, type DebtPersonRow } from "./debts";

const personSelect = {
  id: true,
  name: true,
  entries: {
    select: {
      id: true,
      kind: true,
      day: true,
      amount: true,
      note: true,
      accountId: true,
      createdAt: true,
      account: { select: { name: true } },
      month: { select: { year: true, month: true } },
    },
  },
} as const;

type RawPerson = {
  id: string;
  name: string;
  entries: {
    id: string;
    kind: DebtPersonRow["entries"][number]["kind"];
    day: number;
    amount: number;
    note: string | null;
    accountId: string;
    createdAt: Date;
    account: { name: string };
    month: { year: number; month: number };
  }[];
};

const toRow = (person: RawPerson): DebtPersonRow => ({
  id: person.id,
  name: person.name,
  entries: person.entries.map((entry) => ({
    id: entry.id,
    kind: entry.kind,
    year: entry.month.year,
    month: entry.month.month,
    day: entry.day,
    amount: entry.amount,
    note: entry.note,
    accountId: entry.accountId,
    accountName: entry.account.name,
    addedAt: entry.createdAt.getTime(),
  })),
});

export const loadDebtBook = cache(async function loadDebtBook(userId: string) {
  const people = await db.debtPerson.findMany({
    where: { userId },
    select: personSelect,
  });
  return buildDebtBook(people.map(toRow));
});
