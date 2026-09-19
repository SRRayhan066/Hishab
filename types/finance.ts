export type FinanceActionResult = { error?: string };

export type NewRowResult = FinanceActionResult & { id?: string };

/** A section save hands the rows back carrying their database ids. */
export type SectionSaveResult = FinanceActionResult & {
  rows?: { id: string; name: string; amount: string }[];
};

export type {
  PlanRowValues,
  NewCategoryValues,
  ExpenseValues,
} from "@/lib/validation/finance";
