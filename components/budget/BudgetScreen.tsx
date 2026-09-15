"use client";

import { useMemo, useState } from "react";
import { formatTaka } from "@/lib/finance/format";
import {
  buildBudgetPlan,
  dropRow,
  patchRow,
  rowsTotal,
  toBudgetRows,
  toVariableRows,
  type BudgetRow,
  type VariableBudgetRow,
} from "@/lib/finance/budget";
import type { MonthData } from "@/lib/finance/types";
import { BudgetSection, type SectionRow } from "./BudgetSection";
import { PlanSummary } from "./PlanSummary";

type BudgetScreenProps = {
  initialData: MonthData;
  monthName: string;
  daysInMonth: number;
};

const newId = (prefix: string) => `${prefix}${Date.now()}`;

export function BudgetScreen({
  initialData,
  monthName,
  daysInMonth,
}: BudgetScreenProps) {
  const [income, setIncome] = useState<BudgetRow[]>(() =>
    toBudgetRows(initialData.income),
  );
  const [fixed, setFixed] = useState<BudgetRow[]>(() =>
    toBudgetRows(initialData.fixed),
  );
  const [variable, setVariable] = useState<VariableBudgetRow[]>(() =>
    toVariableRows(initialData.variable),
  );
  const [focusId, setFocusId] = useState<string | null>(null);

  const incomeTotal = rowsTotal(income);
  const fixedTotal = rowsTotal(fixed);
  const variableBudget = rowsTotal(variable);

  const plan = useMemo(
    () => buildBudgetPlan(incomeTotal, fixedTotal, variableBudget, daysInMonth),
    [incomeTotal, fixedTotal, variableBudget, daysInMonth],
  );

  const variableRows: SectionRow[] = variable.map((row) => {
    const budget = Number(row.amount) || 0;

    if (row.spent > budget) {
      return {
        ...row,
        note: `এই মাসে এখনই ${formatTaka(row.spent)} খরচ হয়ে গেছে — সীমার চেয়ে ${formatTaka(row.spent - budget)} বেশি।`,
        noteTone: "warn",
      };
    }

    return {
      ...row,
      note:
        row.spent > 0
          ? `এই মাসে এ পর্যন্ত ${formatTaka(row.spent)} খরচ হয়েছে।`
          : undefined,
      noteTone: "muted",
    };
  });

  const addIncome = () => {
    const id = newId("i");
    setIncome((rows) => [...rows, { id, name: "", amount: "" }]);
    setFocusId(id);
  };

  const addFixed = () => {
    const id = newId("f");
    setFixed((rows) => [...rows, { id, name: "", amount: "" }]);
    setFocusId(id);
  };

  const addVariable = () => {
    const id = newId("v");
    setVariable((rows) => [...rows, { id, name: "", amount: "", spent: 0 }]);
    setFocusId(id);
  };

  return (
    <div className="flex flex-col gap-4">
      <PlanSummary plan={plan} monthName={monthName} />

      <div className="grid gap-4 items-start [grid-template-columns:repeat(auto-fit,minmax(320px,1fr))]">
        <BudgetSection
          title="যা আসে"
          hint="বেতন, টিউশন, ভাড়া — যেখান থেকেই আসুক।"
          rows={income}
          namePlaceholder="আয়ের নাম"
          emptyLabel="এখনো কোনো আয়ের খাত লেখা হয়নি।"
          addLabel="আয়ের খাত যোগ করো"
          totalLabel="মোট আয়"
          total={incomeTotal}
          accent
          focusId={focusId}
          onNameChange={(id, value) =>
            setIncome((rows) => patchRow(rows, id, { name: value }))
          }
          onAmountChange={(id, value) =>
            setIncome((rows) => patchRow(rows, id, { amount: value }))
          }
          onRemove={(id) => setIncome((rows) => dropRow(rows, id))}
          onAdd={addIncome}
        />

        <BudgetSection
          title="যা প্রতি মাসেই যায়"
          hint="পরিবারকে পাঠানো, বাসা ভাড়া, রান্নার আপা, বিল।"
          rows={fixed}
          namePlaceholder="খরচের নাম"
          emptyLabel="এখনো কোনো বাঁধা খরচ লেখা হয়নি।"
          addLabel="বাঁধা খরচ যোগ করো"
          totalLabel="মোট বাঁধা খরচ"
          total={fixedTotal}
          focusId={focusId}
          onNameChange={(id, value) =>
            setFixed((rows) => patchRow(rows, id, { name: value }))
          }
          onAmountChange={(id, value) =>
            setFixed((rows) => patchRow(rows, id, { amount: value }))
          }
          onRemove={(id) => setFixed((rows) => dropRow(rows, id))}
          onAdd={addFixed}
        />
      </div>

      <BudgetSection
        title="হাতখরচের ভাগ"
        hint="প্রতি খাতে এই মাসে সর্বোচ্চ কত খরচ করবে।"
        rows={variableRows}
        namePlaceholder="খাতের নাম"
        emptyLabel="এখনো কোনো খাত লেখা হয়নি।"
        addLabel="খাত যোগ করো"
        totalLabel="মোট হাতখরচ"
        total={variableBudget}
        focusId={focusId}
        onNameChange={(id, value) =>
          setVariable((rows) => patchRow(rows, id, { name: value }))
        }
        onAmountChange={(id, value) =>
          setVariable((rows) => patchRow(rows, id, { amount: value }))
        }
        onRemove={(id) => setVariable((rows) => dropRow(rows, id))}
        onAdd={addVariable}
      />
    </div>
  );
}
