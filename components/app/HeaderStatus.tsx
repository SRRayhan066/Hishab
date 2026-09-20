import { Skeleton } from "@/components/ui/Skeleton";
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
