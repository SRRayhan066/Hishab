export const debtKinds = ["lend", "borrow", "gotBack", "paidBack"] as const;

export type DebtKind = (typeof debtKinds)[number];

export type DebtEntryRow = {
  id: string;
  kind: DebtKind;
  year: number;
  month: number;
  day: number;
  amount: number;
  note: string | null;
  accountId: string;
  accountName: string;
  addedAt: number;
};

export type DebtPersonRow = {
  id: string;
  name: string;
  entries: DebtEntryRow[];
};

export type DebtPersonView = {
  id: string;
  name: string;
  net: number;
  total: number;
  done: number;
  percent: number;
  since: DebtEntryRow | null;
  last: DebtEntryRow | null;
  entries: DebtEntryRow[];
};

export type DebtBook = {
  owed: DebtPersonView[];
  owe: DebtPersonView[];
  settled: DebtPersonView[];
  owedTotal: number;
  oweTotal: number;
  people: DebtPersonView[];
};

export const isMoneyOut = (kind: DebtKind) =>
  kind === "lend" || kind === "paidBack";

export const accountEffect = (kind: DebtKind, amount: number) =>
  isMoneyOut(kind) ? -amount : amount;

export const netEffect = (kind: DebtKind, amount: number) =>
  kind === "lend" || kind === "paidBack" ? amount : -amount;

export const isRepayment = (kind: DebtKind) =>
  kind === "gotBack" || kind === "paidBack";

export const debtNet = (entries: Pick<DebtEntryRow, "kind" | "amount">[]) =>
  entries.reduce((net, entry) => net + netEffect(entry.kind, entry.amount), 0);

const chronological = (a: DebtEntryRow, b: DebtEntryRow) =>
  a.year - b.year ||
  a.month - b.month ||
  a.day - b.day ||
  a.addedAt - b.addedAt;

function openedAt(entries: DebtEntryRow[]): DebtEntryRow | null {
  let since: DebtEntryRow | null = null;
  let running = 0;

  for (const entry of entries) {
    const next = running + netEffect(entry.kind, entry.amount);
    if (next === 0) since = null;
    else if (running === 0 || Math.sign(next) !== Math.sign(running)) since = entry;
    running = next;
  }

  return since;
}

export function buildPersonView(person: DebtPersonRow): DebtPersonView {
  const oldestFirst = [...person.entries].sort(chronological);
  const sumOf = (...kinds: DebtKind[]) =>
    oldestFirst
      .filter((entry) => kinds.includes(entry.kind))
      .reduce((sum, entry) => sum + entry.amount, 0);

  const net = debtNet(oldestFirst);
  const total = net >= 0 ? sumOf("lend", "paidBack") : sumOf("borrow", "gotBack");
  const done = net >= 0 ? sumOf("gotBack", "borrow") : sumOf("paidBack", "lend");

  return {
    id: person.id,
    name: person.name,
    net,
    total,
    done,
    percent: total > 0 ? Math.min(100, (done / total) * 100) : 0,
    since: openedAt(oldestFirst),
    last: oldestFirst[oldestFirst.length - 1] ?? null,
    entries: oldestFirst.reverse(),
  };
}

const recent = (a: DebtPersonView, b: DebtPersonView) =>
  (b.last ? chronological(b.last, a.last ?? b.last) : 0);

export function buildDebtBook(people: DebtPersonRow[]): DebtBook {
  const views = people
    .filter((person) => person.entries.length > 0)
    .map(buildPersonView)
    .sort(recent);
  const owed = views.filter((person) => person.net > 0);
  const owe = views.filter((person) => person.net < 0);

  return {
    owed,
    owe,
    settled: views.filter((person) => person.net === 0),
    owedTotal: owed.reduce((sum, person) => sum + person.net, 0),
    oweTotal: owe.reduce((sum, person) => sum - person.net, 0),
    people: views,
  };
}

export function repaymentsHold(
  entries: (Pick<DebtEntryRow, "kind" | "amount"> & { addedAt: number })[],
): boolean {
  let running = 0;

  for (const entry of [...entries].sort((a, b) => a.addedAt - b.addedAt)) {
    if (entry.kind === "gotBack" && entry.amount > running) return false;
    if (entry.kind === "paidBack" && entry.amount > -running) return false;
    running += netEffect(entry.kind, entry.amount);
  }

  return true;
}
