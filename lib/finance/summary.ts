import { BENGALI_MONTHS, formatTaka } from "./format";
import type {
  Burndown,
  BurndownPoint,
  CategoryStat,
  GridLine,
  MonthData,
  MonthSummary,
} from "./types";

const CHART_WIDTH = 760;
const CHART_HEIGHT = 280;
const PAD_LEFT = 6;
const PAD_RIGHT = 6;
const PAD_TOP = 12;
const PAD_BOTTOM = 14;

const sum = (values: number[]) => values.reduce((total, n) => total + n, 0);

function buildBurndown(
  cumulative: number[],
  adjustedBudget: number,
  daysInMonth: number,
  today: number,
  projected: number,
): Burndown {
  const projectedRemaining = adjustedBudget - projected;
  const lowest = Math.min(
    0,
    adjustedBudget - cumulative[today],
    projectedRemaining,
  );
  const minY = lowest < 0 ? lowest * 1.15 : 0;
  const maxY = Math.max(adjustedBudget, 1) * 1.04;

  const toX = (day: number) =>
    PAD_LEFT + (day / daysInMonth) * (CHART_WIDTH - PAD_LEFT - PAD_RIGHT);
  const toY = (value: number) =>
    PAD_TOP +
    (1 - (value - minY) / (maxY - minY)) *
      (CHART_HEIGHT - PAD_TOP - PAD_BOTTOM);

  const points: BurndownPoint[] = [];
  for (let day = 0; day <= today; day += 1) {
    const remaining = adjustedBudget - cumulative[day];
    points.push({ day, remaining, x: toX(day), y: toY(remaining) });
  }

  const actualPoints = points
    .map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`)
    .join(" ");
  const baseY = toY(minY).toFixed(1);

  const grid: GridLine[] = [];
  for (let step = 0; step <= 3; step += 1) {
    const value = minY + (maxY - minY) * (step / 3);
    const y = toY(value);
    grid.push({
      y: Number(y.toFixed(1)),
      yPercent: Number(((y / CHART_HEIGHT) * 100).toFixed(2)),
      label: formatTaka(value),
    });
  }

  const last = points[points.length - 1];

  return {
    width: CHART_WIDTH,
    height: CHART_HEIGHT,
    points,
    actualPoints,
    idealPoints: `${toX(0).toFixed(1)},${toY(adjustedBudget).toFixed(1)} ${toX(daysInMonth).toFixed(1)},${toY(0).toFixed(1)}`,
    projectionPoints: `${last.x.toFixed(1)},${last.y.toFixed(1)} ${toX(daysInMonth).toFixed(1)},${toY(projectedRemaining).toFixed(1)}`,
    areaPoints: `${toX(0).toFixed(1)},${baseY} ${actualPoints} ${last.x.toFixed(1)},${baseY}`,
    today: { x: last.x, y: last.y },
    grid,
    xLabels: [
      {
        xPercent: Number(((toX(1) / CHART_WIDTH) * 100).toFixed(2)),
        label: "১ তারিখ",
        shift: "0",
      },
      {
        xPercent: Number(((last.x / CHART_WIDTH) * 100).toFixed(2)),
        label: "আজ",
        shift: "-50%",
      },
      {
        xPercent: Number(((toX(daysInMonth) / CHART_WIDTH) * 100).toFixed(2)),
        label: "মাসের শেষ",
        shift: "-100%",
      },
    ],
  };
}

export function buildMonthSummary(
  data: MonthData,
  now: Date = new Date(),
): MonthSummary {
  const day = now.getDate();
  const daysInMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
  ).getDate();
  const daysLeft = daysInMonth - day;
  const elapsedFraction = day / daysInMonth;

  const incomeTotal = sum(data.income.map((item) => item.amount));
  const fixedTotal = sum(data.fixed.map((item) => item.amount));
  const variableBudget = sum(data.variable.map((item) => item.budget));

  const spentByCategory = data.variable.map((category) =>
    sum(category.entries.map((entry) => entry.amount)),
  );
  const spentVariable = sum(spentByCategory);

  const lastMonth = data.history.at(-1);
  const carry = lastMonth ? lastMonth.budget - lastMonth.spent : 0;
  const overCarry = carry < 0 ? -carry : 0;
  const adjustedBudget = Math.max(variableBudget - overCarry, 0);

  const idealSoFar = adjustedBudget * elapsedFraction;
  const delta = idealSoFar - spentVariable;
  const isUnderBudget = delta >= 0;
  const projected = day > 0 ? (spentVariable / day) * daysInMonth : 0;
  const safeToSpend = adjustedBudget - spentVariable;
  const perDay = daysLeft > 0 ? safeToSpend / daysLeft : safeToSpend;

  const pastSaved = sum(
    data.history.map((month) => month.budget - month.spent),
  );
  const totalSavings = data.openingSavings + pastSaved;

  const cumulative: number[] = [];
  let running = 0;
  for (let d = 0; d <= daysInMonth; d += 1) {
    if (d > 0) {
      data.variable.forEach((category) =>
        category.entries.forEach((entry) => {
          if (entry.day === d) running += entry.amount;
        }),
      );
    }
    cumulative.push(running);
  }

  const categories: CategoryStat[] = data.variable.map((category, index) => {
    const spent = spentByCategory[index];
    const left = category.budget - spent;
    const aheadOfPace =
      category.budget > 0 && spent > category.budget * elapsedFraction;

    return {
      id: category.id,
      name: category.name,
      budget: category.budget,
      spent,
      percent:
        category.budget > 0
          ? Math.min(100, (spent / category.budget) * 100)
          : 0,
      idealPercent: Math.min(100, elapsedFraction * 100),
      leftLabel:
        left >= 0
          ? `${formatTaka(left)} বাকি`
          : `${formatTaka(-left)} বেশি`,
      detail:
        category.budget > 0
          ? `${formatTaka(category.budget)} এর মধ্যে ${formatTaka(spent)} খরচ`
          : `${formatTaka(spent)} খরচ`,
      tone: left < 0 ? "over" : aheadOfPace ? "warning" : "good",
    };
  });

  return {
    monthName: BENGALI_MONTHS[now.getMonth()],
    year: now.getFullYear(),
    day,
    daysInMonth,
    daysLeft,
    elapsedFraction,
    incomeTotal,
    fixedTotal,
    variableBudget,
    spentVariable,
    overCarry,
    adjustedBudget,
    idealSoFar,
    delta,
    isUnderBudget,
    projected,
    safeToSpend,
    perDay,
    totalSavings,
    spentPercent:
      adjustedBudget > 0
        ? Math.min(100, (spentVariable / adjustedBudget) * 100)
        : 0,
    idealPercent: elapsedFraction * 100,
    categories,
    burndown: buildBurndown(
      cumulative,
      adjustedBudget,
      daysInMonth,
      Math.min(day, daysInMonth),
      projected,
    ),
  };
}
