import { Avatar } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { getCurrentUser } from "@/lib/auth/session";
import { getCurrentMonthView } from "@/lib/finance/view";
import { SavingsChip } from "./SavingsChip";

export { SavingsChipFallback as SavingsStatusFallback } from "./SavingsChip";

/**
 * The two header figures are the only part of the shell that needs the
 * database. They sit behind their own `<Suspense>` boundaries so the rest of
 * the shell — heading, tabs, account button — paints while the query is still
 * running, instead of the whole screen waiting on it.
 *
 * Both read `getCurrentMonthView`, which is request-cached, so the pair costs
 * one query between them, not two.
 */
export async function MonthLine() {
  const { monthLabel } = await getCurrentMonthView();

  return (
    <p className="text-ink-muted text-[14px] font-medium">{monthLabel}</p>
  );
}

export function MonthLineFallback() {
  return <Skeleton className="my-[5px] h-[11px] w-40 rounded-[4px]" />;
}

export async function SavingsStatus() {
  const { savingsLabel } = await getCurrentMonthView();

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
