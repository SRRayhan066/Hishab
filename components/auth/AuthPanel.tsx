"use client";

import { Logo } from "@/components/icons/Logo";
import { useT } from "@/lib/i18n/client";

const points = ["pointDaily", "pointCarry", "pointPrivate"] as const;

export function AuthPanel() {
  const t = useT("auth");

  return (
    <aside className="bg-panel hidden flex-col justify-between gap-9 px-9 py-10 md:flex md:min-h-[420px]">
      <Logo />

      <div>
        <p className="font-display text-[clamp(26px,4.4vw,34px)] leading-[1.3] font-bold tracking-[-0.01em]">
          {t("panelHeadlineTop")}
          <br />
          {t("panelHeadlineBottom")}
        </p>
        <p className="text-ink-panel mt-[14px] max-w-[30ch] text-[16px] leading-[1.6]">
          {t("panelBody")}
        </p>
      </div>

      <ul className="flex flex-col gap-[11px]">
        {points.map((point) => (
          <li
            key={point}
            className="text-ink-panel flex items-center gap-[11px] text-[15px]"
          >
            <span className="bg-primary h-[7px] w-[7px] flex-none rounded-full" />
            {t(point)}
          </li>
        ))}
      </ul>
    </aside>
  );
}
