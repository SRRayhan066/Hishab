"use client";

import type { DebtEntryRow } from "@/lib/finance/debts";
import { currentPeriod } from "@/lib/finance/period";
import { useFormat, useT } from "@/lib/i18n/client";

export function useDebtDate() {
  const common = useT("common");
  const format = useFormat();
  const thisYear = currentPeriod().year;

  return ({ day, month, year }: Pick<DebtEntryRow, "day" | "month" | "year">) => {
    const date = common("dayMonth", {
      day: format.digits(day),
      month: format.month(month - 1),
    });
    return year === thisYear ? date : `${date} ${format.digits(year)}`;
  };
}
