"use client";

import type { AuthMode } from "@/types/auth";
import { cn } from "@/lib/utils";

const tabs: { mode: AuthMode; label: string }[] = [
  { mode: "login", label: "সাইন ইন" },
  { mode: "signup", label: "সাইন আপ" },
];

type AuthTabsProps = {
  mode: AuthMode;
  onChange: (mode: AuthMode) => void;
  panelId: string;
};

export function AuthTabs({ mode, onChange, panelId }: AuthTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="সাইন ইন বা সাইন আপ"
      className="bg-field-alt rounded-tabs flex gap-[5px] p-[5px]"
    >
      {tabs.map((tab) => {
        const active = tab.mode === mode;

        return (
          <button
            key={tab.mode}
            type="button"
            role="tab"
            id={`auth-tab-${tab.mode}`}
            aria-selected={active}
            aria-controls={panelId}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(tab.mode)}
            className={cn(
              "rounded-tab focus-visible:outline-primary min-h-[46px] flex-1 cursor-pointer px-3 py-3 text-[15px] font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
              active
                ? "bg-surface text-ink shadow-[0_1px_3px_rgba(42,40,37,0.09)]"
                : "text-ink-muted hover:text-ink bg-transparent",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
