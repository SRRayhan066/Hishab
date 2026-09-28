export type TourStepId =
  | "welcome"
  | "balance"
  | "burndown"
  | "categories"
  | "header"
  | "nav"
  | "addForm"
  | "addSummary"
  | "budgetIncome"
  | "budgetPlan"
  | "accountList"
  | "transfers"
  | "savings"
  | "history"
  | "profile"
  | "done";

export type TourStep = {
  id: TourStepId;
  route: string;
  centered?: boolean;
};

export const tourSteps: TourStep[] = [
  { id: "welcome", route: "/home", centered: true },
  { id: "balance", route: "/home" },
  { id: "burndown", route: "/home" },
  { id: "categories", route: "/home" },
  { id: "header", route: "/home" },
  { id: "nav", route: "/home" },
  { id: "addForm", route: "/add" },
  { id: "addSummary", route: "/add" },
  { id: "budgetIncome", route: "/budget" },
  { id: "budgetPlan", route: "/budget" },
  { id: "accountList", route: "/accounts" },
  { id: "transfers", route: "/accounts" },
  { id: "savings", route: "/accounts" },
  { id: "history", route: "/history" },
  { id: "profile", route: "/profile" },
  { id: "done", route: "/profile", centered: true },
];

export function tourTarget(id: TourStepId) {
  return `[data-tour="${id}"]`;
}
