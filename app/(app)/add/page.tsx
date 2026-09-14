import { AppShell } from "@/components/app/AppShell";
import { ComingSoon } from "@/components/app/ComingSoon";
import { getCurrentMonthView } from "@/lib/finance/view";

export const dynamic = "force-dynamic";

export default function Page() {
  const { monthLabel, savingsLabel } = getCurrentMonthView();

  return (
    <AppShell
      title="খরচ যোগ করা"
      monthLabel={monthLabel}
      savingsLabel={savingsLabel}
    >
      <ComingSoon title="খরচ যোগ করা" />
    </AppShell>
  );
}
