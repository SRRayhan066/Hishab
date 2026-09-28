import type { Format } from "@/lib/i18n/format";
import type { Translator } from "@/lib/i18n/translate";
import type {
  AxisLabel,
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

export type SummaryText = {
  t: Translator<"summary">;
  format: Format;
};

function buildBurndown(
  cumulative: number[],
  plannedTotal: number,
  daysInMonth: number,
  today: number,
  projected: number,
  { t, format }: SummaryText,
): Burndown {
  const projectedRemaining = plannedTotal - projected;
  const lowest = Math.min(
    0,
    plannedTotal - cumulative[today],
    projectedRemaining,
  );
  const minY = lowest < 0 ? lowest * 1.15 : 0;
  const maxY = Math.max(plannedTotal, 1) * 1.04;

  const toX = (day: number) =>
    PAD_LEFT + (day / daysInMonth) * (CHART_WIDTH - PAD_LEFT - PAD_RIGHT);
  const toY = (value: number) =>
    PAD_TOP +
    (1 - (value - minY) / (maxY - minY)) *
      (CHART_HEIGHT - PAD_TOP - PAD_BOTTOM);

  const points: BurndownPoint[] = [];
  for (let day = 0; day <= today; day += 1) {
    const remaining = plannedTotal - cumulative[day];
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
      label: format.taka(value),
    });
  }

  const last = points[points.length - 1];

  return {
    width: CHART_WIDTH,
    height: CHART_HEIGHT,
    points,
    actualPoints,
    idealPoints: `${toX(0).toFixed(1)},${toY(plannedTotal).toFixed(1)} ${toX(daysInMonth).toFixed(1)},${toY(0).toFixed(1)}`,
    projectionPoints: `${last.x.toFixed(1)},${last.y.toFixed(1)} ${toX(daysInMonth).toFixed(1)},${toY(projectedRemaining).toFixed(1)}`,
    areaPoints: `${toX(0).toFixed(1)},${baseY} ${actualPoints} ${last.x.toFixed(1)},${baseY}`,
    today: { x: last.x, y: last.y },
    grid,
    xLabels: axisLabels(
      (toX(1) / CHART_WIDTH) * 100,
      (last.x / CHART_WIDTH) * 100,
      (toX(daysInMonth) / CHART_WIDTH) * 100,
      t,
    ),
  };
}

function axisLabels(
  startPercent: number,
  todayPercent: number,
  endPercent: number,
  t: Translator<"summary">,
): AxisLabel[] {
  const labels: AxisLabel[] = [];

  if (todayPercent - startPercent > 24) {
    labels.push({
      xPercent: Number(startPercent.toFixed(2)),
      label: t("axisStart"),
      shift: "0",
    });
  }

  labels.push({
    xPercent: Number(todayPercent.toFixed(2)),
    label: t("axisToday"),
    shift: `-${todayPercent.toFixed(2)}%`,
  });

  if (endPercent - todayPercent > 30) {
    labels.push({
      xPercent: Number(endPercent.toFixed(2)),
      label: t("axisEnd"),
      shift: "-100%",
    });
  }

  return labels;
}

export function buildMonthSummary(
  data: MonthData,
  now: Date,
  text: SummaryText,
): MonthSummary {
  const { t, format } = text;
  const day = now.getDate();
  const daysInMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
  ).getDate();
  const daysLeft = daysInMonth - day;
  const elapsedFraction = day / daysInMonth;

  const incomeTotal = sum(data.income.map((item) => item.amount));
  const plannedTotal = sum(data.categories.map((item) => item.budget));

  const spentByCategory = data.categories.map((category) =>
    sum(category.entries.map((entry) => entry.amount)),
  );
  const spentTotal = sum(spentByCategory);

  // Only the unpaid part of each line is still owed. A category that went
  // over its plan does not lend its overspend back to the others.
  const remainingPlanned = sum(
    data.categories.map((category, index) =>
      Math.max(category.budget - spentByCategory[index], 0),
    ),
  );

  const balance = sum(data.accounts.map((account) => account.balance));

  const freeToSpend = balance - remainingPlanned;

  const idealSoFar = plannedTotal * elapsedFraction;
  const paceDelta = idealSoFar - spentTotal;
  const isUnderPlan = paceDelta >= 0;
  const projected = day > 0 ? (spentTotal / day) * daysInMonth : 0;

  const cumulative: number[] = [];
  let running = 0;
  for (let d = 0; d <= daysInMonth; d += 1) {
    if (d > 0) {
      data.categories.forEach((category) =>
        category.entries.forEach((entry) => {
          if (entry.day === d) running += entry.amount;
        }),
      );
    }
    cumulative.push(running);
  }

  const categories: CategoryStat[] = data.categories.map((category, index) => {
    const spent = spentByCategory[index];

    // Nothing was planned for a temporary category, so there is no budget for
    // it to be under or over — only what has gone out.
    if (category.temporary) {
      return {
        id: category.id,
        name: category.name,
        budget: 0,
        temporary: true,
        spent,
        percent: 0,
        idealPercent: 0,
        leftLabel: t("spent", { amount: format.taka(spent) }),
        detail: t("temporaryDetail"),
        tone: "good",
      };
    }

    const left = category.budget - spent;
    const aheadOfPace =
      category.budget > 0 && spent > category.budget * elapsedFraction;

    return {
      id: category.id,
      name: category.name,
      budget: category.budget,
      temporary: false,
      spent,
      percent:
        category.budget > 0
          ? Math.min(100, (spent / category.budget) * 100)
          : 0,
      idealPercent: Math.min(100, elapsedFraction * 100),
      leftLabel:
        left >= 0
          ? t("left", { amount: format.taka(left) })
          : t("over", { amount: format.taka(-left) }),
      detail:
        category.budget > 0
          ? t("detail", {
              budget: format.taka(category.budget),
              spent: format.taka(spent),
            })
          : t("spent", { amount: format.taka(spent) }),
      tone: left < 0 ? "over" : aheadOfPace ? "warning" : "good",
    };
  });

  return {
    monthName: format.month(now.getMonth()),
    monthIndex: now.getMonth(),
    year: now.getFullYear(),
    day,
    daysInMonth,
    daysLeft,
    elapsedFraction,
    incomeTotal,
    plannedTotal,
    spentTotal,
    remainingPlanned,
    balance,
    freeToSpend,
    perDay: daysLeft > 0 ? freeToSpend / daysLeft : freeToSpend,
    projected,
    isUnderPlan,
    paceDelta,
    spentPercent:
      plannedTotal > 0 ? Math.min(100, (spentTotal / plannedTotal) * 100) : 0,
    idealPercent: elapsedFraction * 100,
    categories,
    burndown: buildBurndown(
      cumulative,
      plannedTotal,
      daysInMonth,
      Math.min(day, daysInMonth),
      projected,
      text,
    ),
  };
}
