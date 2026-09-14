export type IncomeSource = {
  id: string;
  name: string;
  amount: number;
};

export type FixedCost = {
  id: string;
  name: string;
  amount: number;
};

export type ExpenseEntry = {
  id: string;
  day: number;
  amount: number;
};

export type VariableCategory = {
  id: string;
  name: string;
  budget: number;
  entries: ExpenseEntry[];
};

export type PastMonth = {
  month: string;
  spent: number;
  budget: number;
};

export type MonthData = {
  openingSavings: number;
  income: IncomeSource[];
  fixed: FixedCost[];
  variable: VariableCategory[];
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
  year: number;
  day: number;
  daysInMonth: number;
  daysLeft: number;
  elapsedFraction: number;
  incomeTotal: number;
  fixedTotal: number;
  variableBudget: number;
  spentVariable: number;
  overCarry: number;
  adjustedBudget: number;
  idealSoFar: number;
  delta: number;
  isUnderBudget: boolean;
  projected: number;
  safeToSpend: number;
  perDay: number;
  totalSavings: number;
  spentPercent: number;
  idealPercent: number;
  categories: CategoryStat[];
  burndown: Burndown;
};
