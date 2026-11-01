import type { MoneyAccount } from "./types";

export function balanceWithOpening(
  account: MoneyAccount | undefined,
  opening: number,
): number {
  if (!account) return opening;
  return account.balance - account.openingBalance + opening;
}

export function keepsHistory(account: MoneyAccount): boolean {
  return account.inUse || (account.openingLocked && account.openingBalance !== 0);
}

type Balance = Pick<MoneyAccount, "id" | "name" | "balance">;

export function overdrawnAccount<T extends Balance>(
  accounts: T[],
  changes: Map<string, number>,
): T | undefined {
  return accounts.find((account) => {
    const change = changes.get(account.id) ?? 0;
    return change < 0 && account.balance + change < 0;
  });
}

type Deposit = { accountId: string; amount: number };

export function incomeChanges(
  before: Deposit[],
  after: Deposit[],
): Map<string, number> {
  const changes = new Map<string, number>();
  const add = ({ accountId, amount }: Deposit, sign: number) =>
    changes.set(accountId, (changes.get(accountId) ?? 0) + sign * amount);

  before.forEach((row) => add(row, -1));
  after.forEach((row) => add(row, 1));
  return changes;
}

export function openingChanges(
  accounts: Pick<MoneyAccount, "id" | "openingBalance">[],
  rows: { id: string; amount: number }[],
): Map<string, number> {
  const opening = new Map(
    accounts.map((account) => [account.id, account.openingBalance]),
  );
  const changes = new Map<string, number>();

  rows.forEach((row) => {
    const before = opening.get(row.id);
    if (before !== undefined) changes.set(row.id, row.amount - before);
  });
  return changes;
}

export function accountNames(accounts: MoneyAccount[]): Map<string, string> {
  return new Map(accounts.map((account) => [account.id, account.name]));
}
