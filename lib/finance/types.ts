export type IncomeSource = {
  id: string;
  name: string;
  amount: number;
};

export type ExpenseEntry = {
  id: string;
  day: number;
  amount: number;
  addedAt?: number;
};

/**
 * One planned line of spending — rent, groceries, transport, all the same
 * kind of thing. `budget` is only a forecast; money moves when an expense is
 * entered against it.
 */
export type Category = {
  id: string;
  name: string;
  budget: number;
  entries: ExpenseEntry[];
};

export type PastMonth = {
  year: number;
  /** 1–12. */
  month: number;
  /** Bengali month name, for display. */
  label: string;
  /** Total that came in that month. */
  income: number;
  /** What the plan said the month would cost. */
  budget: number;
  /** What was actually spent. */
  spent: number;
};

export type MonthData = {
  /** What was in the wallet before the app started tracking anything. */
  openingBalance: number;
  income: IncomeSource[];
  categories: Category[];
  history: PastMonth[];
};

export type CategoryStat = {
  id: string;
  name: string;
  budget: number;
  spent: number;
  percent: number;
  idealPercent: number;
  leftLabel: string;
  detail: string;
  tone: "good" | "warning" | "over";
};

export type BurndownPoint = {
  day: number;
  remaining: number;
  x: number;
  y: number;
};

export type GridLine = {
  y: number;
  yPercent: number;
  label: string;
};

export type AxisLabel = {
  xPercent: number;
  label: string;
  shift: string;
};

export type Burndown = {
  width: number;
  height: number;
  points: BurndownPoint[];
  actualPoints: string;
  idealPoints: string;
  projectionPoints: string;
  areaPoints: string;
  today: { x: number; y: number };
  grid: GridLine[];
  xLabels: AxisLabel[];
};

export type MonthSummary = {
  monthName: string;
  monthIndex: number;
  year: number;
  day: number;
  daysInMonth: number;
  daysLeft: number;
  elapsedFraction: number;

  /** Money in, this month. */
  incomeTotal: number;
  /** What the plan says this month should cost, in total. */
  plannedTotal: number;
  /** What has actually been paid out this month. */
  spentTotal: number;
  /** Of the plan, what is still unpaid — bills yet to come. */
  remainingPlanned: number;

  /** The real wallet figure: opening balance, plus all income, less all spending. */
  balance: number;
  /** Balance that is not already promised to the rest of the plan. */
  freeToSpend: number;
  /** Free money spread across the days left. */
  perDay: number;

  /** Where this month's spending lands if the current pace holds. */
  projected: number;
  isUnderPlan: boolean;
  /** How far off the plan's pace the spending is, today. */
  paceDelta: number;

  spentPercent: number;
  idealPercent: number;
  categories: CategoryStat[];
  burndown: Burndown;
};
