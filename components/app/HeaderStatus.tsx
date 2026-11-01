import { Avatar } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { getCurrentUser } from "@/lib/auth/session";
import { getMonthView } from "@/lib/finance/view";
import { MonthPicker } from "./MonthPicker";
import { SavingsChip } from "./SavingsChip";

export { SavingsChipFallback as SavingsStatusFallback } from "./SavingsChip";

/**
 * The two header figures are the only part of the shell that needs the
 * database. They sit behind their own `<Suspense>` boundaries so the rest of
 * the shell — heading, tabs, account button — paints while the query is still
 * running, instead of the whole screen waiting on it.
 *
 * Both read `getMonthView`, which is request-cached, so the pair costs
 * one query between them, not two.
 */
export async function MonthLine() {
  const { monthLabel, daysLabel, months, period } = await getMonthView();

  if (months.length < 2) {
    return (
      <p className="text-ink-muted text-[14px] font-medium">{monthLabel}</p>
    );
  }

  return <MonthPicker months={months} selected={period} daysLabel={daysLabel} />;
}

export function MonthLineFallback() {
  return <Skeleton className="h-[46px] w-[260px] rounded-[12px]" />;
}

export async function SavingsStatus() {
  const { savingsLabel } = await getMonthView();

  return <SavingsChip label={savingsLabel} />;
}

export async function ProfileAvatar() {
  const user = await getCurrentUser();
  if (!user) return <ProfileAvatarFallback />;

  return <Avatar seed={user.email} animate="hover" className="h-9 w-9" />;
}

export function ProfileAvatarFallback() {
  return <Skeleton className="h-7 w-7" />;
}
