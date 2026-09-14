"use client";

import { useRef, useState } from "react";
import { formatTaka } from "@/lib/finance/format";
import type { Burndown } from "@/lib/finance/types";

type BurndownChartProps = {
  burndown: Burndown;
  isUnderBudget: boolean;
  monthName: string;
};

export function BurndownChart({
  burndown,
  isUnderBudget,
  monthName,
}: BurndownChartProps) {
  const { width, height, points, grid, xLabels, today } = burndown;
  const plotRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  const lineColor = isUnderBudget
    ? "var(--color-primary)"
    : "var(--color-danger)";
  const areaFill = isUnderBudget
    ? "rgba(79,122,74,0.10)"
    : "rgba(192,71,44,0.09)";

  const toLeft = (x: number) => `${(x / width) * 100}%`;
  const toTop = (y: number) => `${(y / height) * 100}%`;

  const handleMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const box = plotRef.current?.getBoundingClientRect();
    if (!box || box.width === 0) return;

    const x = ((event.clientX - box.left) / box.width) * width;
    let nearest = 0;
    for (let i = 1; i < points.length; i += 1) {
      if (Math.abs(points[i].x - x) < Math.abs(points[nearest].x - x)) {
        nearest = i;
      }
    }
    setHovered(nearest);
  };

  const active = hovered === null ? null : points[hovered];

  return (
    <div className="mt-3 pl-[54px]">
      <div
        ref={plotRef}
        onPointerMove={handleMove}
        onPointerLeave={() => setHovered(null)}
        className="relative touch-pan-y"
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          className="block h-[190px] w-full sm:h-[240px] lg:h-[280px]"
          role="img"
          aria-label={`${monthName} মাসের খরচের বার্নডাউন চার্ট। বিস্তারিত নিচের টেবিলে আছে।`}
        >
          {grid.map((line) => (
            <line
              key={line.y}
              x1={0}
              y1={line.y}
              x2={width}
              y2={line.y}
              stroke="#f0ebe1"
              strokeWidth={1.5}
              vectorEffect="non-scaling-stroke"
            />
          ))}

          <polygon points={burndown.areaPoints} fill={areaFill} />

          <polyline
            points={burndown.idealPoints}
            fill="none"
            stroke="#b8b1a1"
            strokeWidth={2}
            strokeDasharray="7 7"
            vectorEffect="non-scaling-stroke"
          />

          <polyline
            points={burndown.projectionPoints}
            fill="none"
            stroke={lineColor}
            strokeWidth={2}
            strokeDasharray="3 6"
            opacity={0.5}
            vectorEffect="non-scaling-stroke"
          />

          <polyline
            points={burndown.actualPoints}
            fill="none"
            stroke={lineColor}
            strokeWidth={3.5}
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {grid.map((line) => (
          <span
            key={`${line.label}-${line.y}`}
            className="text-ink-faint absolute -left-[54px] w-[46px] -translate-y-1/2 text-right text-[12px] font-medium"
            style={{ top: toTop(line.y) }}
          >
            {line.label}
          </span>
        ))}

        {xLabels.map((label) => (
          <span
            key={label.label}
            className="text-ink-faint absolute -bottom-[22px] text-[12px] font-medium whitespace-nowrap"
            style={{
              left: `${label.xPercent}%`,
              transform: `translateX(${label.shift})`,
            }}
          >
            {label.label}
          </span>
        ))}

        {active && (
          <span
            className="pointer-events-none absolute top-0 bottom-0 w-px bg-[#c6bfae]"
            style={{ left: toLeft(active.x) }}
          />
        )}

        <span
          className="pointer-events-none absolute h-[14px] w-[14px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[3.5px] bg-white"
          style={{
            left: toLeft(today.x),
            top: toTop(today.y),
            borderColor: lineColor,
          }}
        />

        {active && (
          <span
            className="pointer-events-none absolute h-[14px] w-[14px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white"
            style={{
              left: toLeft(active.x),
              top: toTop(active.y),
              background: lineColor,
            }}
          />
        )}

        {active && (
          <div
            className="bg-surface border-line pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-[12px] border px-3 py-2 shadow-[0_6px_20px_rgba(42,40,37,0.12)]"
            style={{
              left: `${Math.min(82, Math.max(18, (active.x / width) * 100))}%`,
            }}
          >
            <p className="text-ink-muted text-[12px] font-medium whitespace-nowrap">
              {active.day} {monthName}
            </p>
            <p className="font-display text-[16px] font-bold whitespace-nowrap">
              {formatTaka(active.remaining)} বাকি ছিল
            </p>
          </div>
        )}
      </div>

      <div className="sr-only">
        <table>
          <caption>{monthName} মাসের প্রতিদিন শেষে বাকি থাকা টাকা</caption>
          <thead>
            <tr>
              <th scope="col">তারিখ</th>
              <th scope="col">বাকি</th>
            </tr>
          </thead>
          <tbody>
            {points.map((point) => (
              <tr key={point.day}>
                <th scope="row">{point.day}</th>
                <td>{formatTaka(point.remaining)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
