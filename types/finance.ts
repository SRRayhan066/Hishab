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
  NewCategoryValues,
  ExpenseValues,
  TransferValues,
} from "@/lib/validation/finance";
