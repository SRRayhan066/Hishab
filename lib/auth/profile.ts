import "server-only";
import { db } from "@/lib/db";
import { currentPeriod, type Period } from "@/lib/finance/period";

export type Profile = {
  name: string;
  email: string;
  joined: Period;
  monthsTracked: number;
};

export async function loadProfile(userId: string): Promise<Profile | null> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true, createdAt: true },
  });
  if (!user) return null;

  const joined = currentPeriod(user.createdAt);
  const now = currentPeriod();

  return {
    name: user.name,
    email: user.email,
    joined,
    monthsTracked: (now.year - joined.year) * 12 + (now.month - joined.month) + 1,
  };
}
