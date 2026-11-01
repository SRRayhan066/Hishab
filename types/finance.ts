export type FinanceActionResult = { error?: string };

export type NewRowResult = FinanceActionResult & { id?: string };

/** A section save hands the rows back carrying their database ids. */
export type SectionSaveResult = FinanceActionResult & {
  rows?: {
    id: string;
    name: string;
    amount: string;
    accountId?: string;
    color?: string;
    icon?: string;
  }[];
};

export type {
  PlanRowValues,
  AccountRowValues,
  NewAccountValues,
  NewCategoryValues,
  ExpenseValues,
  TransferValues,
  DebtValues,
  BalanceCorrectionValues,
} from "@/lib/validation/finance";
