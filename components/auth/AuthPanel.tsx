"use client";

import { Logo } from "@/components/icons/Logo";
import { useT } from "@/lib/i18n/client";

const points = ["pointDaily", "pointBudget", "pointDebts"] as const;

export function AuthPanel() {
  const t = useT("auth");

  return (
    <aside className="bg-panel hidden flex-col gap-7 px-10 py-11 xl:flex">
      <Logo />

      <p className="font-display text-[32px] leading-[1.3] font-bold tracking-[-0.01em] text-pretty">
        {t("panelHeadlineTop")} {t("panelHeadlineBottom")}
      </p>

      <ul className="mt-auto flex flex-col gap-3.5">
        {points.map((point) => (
          <li
            key={point}
            className="text-ink-panel flex gap-3 text-[15px] leading-[1.5]"
          >
            <span className="bg-primary mt-2 h-2 w-2 flex-none rounded-full" />
            {t(point)}
          </li>
        ))}
      </ul>
    </aside>
  );
}
