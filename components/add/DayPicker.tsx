"use client";

import { cn } from "@/lib/utils";

type DayPickerProps = {
  id: string;
  label: string;
  year: number;
  monthIndex: number;
  today: number;
  day: number;
  onChange: (day: number) => void;
};

const pad = (value: number) => String(value).padStart(2, "0");

function quickDays(today: number) {
  const options = [{ label: "আজ", day: today }];
  if (today > 1) options.push({ label: "গতকাল", day: today - 1 });
  return options;
}

export function DayPicker({
  id,
  label,
  year,
  monthIndex,
  today,
  day,
  onChange,
}: DayPickerProps) {
  const month = `${year}-${pad(monthIndex + 1)}`;

  return (
    <>
      <label
        htmlFor={id}
        className="text-ink-muted mt-5 block text-[15px] font-medium"
      >
        {label}
      </label>

      <div className="mt-2.5 flex flex-wrap gap-2">
        <input
          id={id}
          type="date"
          value={`${month}-${pad(day)}`}
          min={`${month}-01`}
          max={`${month}-${pad(today)}`}
          onChange={(event) => {
            const picked = Number(event.target.value.slice(8, 10));
            if (picked >= 1 && picked <= today) onChange(picked);
          }}
          className="bg-field border-line rounded-field text-ink focus:border-primary focus:bg-surface min-h-[46px] min-w-[150px] flex-1 border-[1.5px] px-[14px] text-[15px] outline-none transition-colors"
        />

        <div className="flex gap-2">
          {quickDays(today).map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={() => onChange(option.day)}
              aria-pressed={day === option.day}
              className={cn(
                "focus-visible:outline-primary min-h-[46px] cursor-pointer rounded-full border-[1.5px] px-4 text-[15px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
                day === option.day
                  ? "border-primary bg-panel text-primary-dark"
                  : "border-line bg-field text-ink-soft hover:border-line-strong",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
