import "server-only";
import { db } from "@/lib/db";
import { currentPeriod, periodLabel } from "@/lib/finance/period";

export type Profile = {
  name: string;
  email: string;
  joinedLabel: string;
  monthsTracked: number;
  entries: number;
};

export async function loadProfile(userId: string): Promise<Profile | null> {
  const [user, entries] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, createdAt: true },
    }),
    db.expense.count({ where: { category: { month: { userId } } } }),
  ]);
  if (!user) return null;

  const joined = currentPeriod(user.createdAt);
  const now = currentPeriod();

  return {
    name: user.name,
    email: user.email,
    joinedLabel: `${periodLabel(joined)} ${joined.year}`,
    monthsTracked: (now.year - joined.year) * 12 + (now.month - joined.month) + 1,
    entries,
  };
}
