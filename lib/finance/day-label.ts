import type { Format } from "@/lib/i18n/format";

type DayText = {
  today: string;
  yesterday: string;
  dayMonth: (day: number) => string;
};

export function dayLabel(
  day: number,
  todayDay: number | null,
  { today, yesterday, dayMonth }: DayText,
): string {
  if (day === todayDay) return today;
  if (todayDay !== null && day === todayDay - 1) return yesterday;
  return dayMonth(day);
}

export function shortDay(format: Format, day: number, monthIndex: number) {
  return `${format.digits(day)} ${format.monthShort(monthIndex)}`;
}
