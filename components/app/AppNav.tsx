"use client";

import type { ReactNode } from "react";
import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import {
  ChartPie,
  Handshake,
  History,
  House,
  Plus,
  ReceiptText,
  WalletMinimal,
  type LucideIcon,
} from "lucide-react";
import { useEntrySheet } from "@/components/entry/EntrySheetProvider";
import { Logo } from "@/components/icons/Logo";
import { useT } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

type NavKey = "home" | "spending" | "budget" | "history" | "debts" | "accounts";

const destinations: Record<
  NavKey,
  { href: string; icon: LucideIcon; short?: "historyShort" }
> = {
  home: { href: "/home", icon: House },
  spending: { href: "/spending", icon: ReceiptText },
  budget: { href: "/budget", icon: ChartPie },
  history: { href: "/history", icon: History, short: "historyShort" },
  debts: { href: "/debts", icon: Handshake },
  accounts: { href: "/accounts", icon: WalletMinimal },
};

const wideItems: NavKey[] = [
  "home",
  "spending",
  "budget",
  "history",
  "debts",
  "accounts",
];

const nearest: Partial<Record<NavKey, NavKey>> = {
  spending: "home",
  history: "budget",
};

function useActive(items: NavKey[]) {
  const pathname = usePathname();
  const current = wideItems.find((key) =>
    pathname === destinations[key].href ||
    pathname.startsWith(`${destinations[key].href}/`),
  );
  if (!current) return null;
  return items.includes(current) ? current : (nearest[current] ?? null);
}

function usePendingOr(active: boolean) {
  const { pending } = useLinkStatus();
  return active || pending;
}

function SideItem({ item, active }: { item: NavKey; active: boolean }) {
  const t = useT("nav");
  const on = usePendingOr(active);
  const Icon = destinations[item].icon;

  return (
    <span
      className={cn(
        "flex h-11 items-center gap-3 rounded-[12px] px-3 text-[15px] font-semibold transition-colors",
        on
          ? "bg-panel text-primary-dark"
          : "text-ink-soft hover:bg-field-alt",
      )}
    >
      <Icon className="h-[21px] w-[21px] flex-none" fill={on ? "currentColor" : "none"} fillOpacity={0.18} />
      {t(item)}
    </span>
  );
}

function RailItem({ item, active }: { item: NavKey; active: boolean }) {
  const t = useT("nav");
  const on = usePendingOr(active);
  const { icon: Icon, short } = destinations[item];

  return (
    <span
      className={cn(
        "flex flex-col items-center gap-1 py-1",
        on ? "text-primary-dark" : "text-ink-soft",
      )}
    >
      <span
        className={cn(
          "flex h-8 w-14 items-center justify-center rounded-full transition-colors",
          on && "bg-panel",
        )}
      >
        <Icon className="h-[22px] w-[22px]" fill={on ? "currentColor" : "none"} fillOpacity={0.18} />
      </span>
      <span className="text-center text-[12px] leading-[1.25] font-semibold">
        {t(short ?? item)}
      </span>
    </span>
  );
}

function BarItem({ item, active }: { item: NavKey; active: boolean }) {
  const t = useT("nav");
  const on = usePendingOr(active);
  const Icon = destinations[item].icon;

  return (
    <span
      className={cn(
        "flex h-14 flex-col items-center justify-center gap-[3px] rounded-[16px] transition-colors",
        on ? "bg-panel text-primary-dark" : "text-ink-soft",
      )}
    >
      <Icon className="h-[23px] w-[23px]" fill={on ? "currentColor" : "none"} fillOpacity={0.18} />
      <span className="text-[12px] font-semibold whitespace-nowrap">
        {t(item)}
      </span>
    </span>
  );
}

const linkFocus =
  "focus-visible:outline-primary rounded-[12px] focus-visible:outline-2 focus-visible:outline-offset-2";

export function Sidebar({ profile }: { profile: ReactNode }) {
  const t = useT("nav");
  const { open } = useEntrySheet();
  const active = useActive(wideItems);

  return (
    <aside className="bg-field border-line-soft sticky top-0 hidden h-dvh w-[244px] flex-none flex-col gap-5 border-r px-4 pt-[22px] pb-[18px] xl:flex">
      <Logo className="px-1.5" />
      <button
        type="button"
        onClick={() => open()}
        className="bg-primary hover:bg-primary-dark font-display focus-visible:outline-primary flex h-12 cursor-pointer items-center justify-center gap-2 rounded-[14px] text-[16px] font-bold text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <Plus className="h-[22px] w-[22px]" strokeWidth={2.4} />
        {t("newEntry")}
      </button>
      <nav aria-label={t("label")} className="grid gap-0.5">
        {wideItems.map((item) => (
          <Link
            key={item}
            href={destinations[item].href}
            aria-current={active === item ? "page" : undefined}
            className={linkFocus}
          >
            <SideItem item={item} active={active === item} />
          </Link>
        ))}
      </nav>
      <div className="mt-auto">{profile}</div>
    </aside>
  );
}

export function Rail({ profile }: { profile: ReactNode }) {
  const t = useT("nav");
  const { open } = useEntrySheet();
  const active = useActive(wideItems);

  return (
    <aside className="bg-field border-line-soft sticky top-0 hidden h-dvh w-[92px] flex-none flex-col items-center gap-[18px] border-r px-2 pt-5 pb-[18px] md:flex xl:hidden">
      <button
        type="button"
        onClick={() => open()}
        aria-label={t("newEntry")}
        className="bg-primary hover:bg-primary-dark focus-visible:outline-primary flex h-14 w-14 cursor-pointer items-center justify-center rounded-[18px] text-white shadow-[0_8px_18px_-8px_rgba(61,95,57,0.7)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <Plus className="h-7 w-7" strokeWidth={2.4} />
      </button>
      <nav aria-label={t("label")} className="grid w-full gap-1.5">
        {wideItems.map((item) => (
          <Link
            key={item}
            href={destinations[item].href}
            aria-current={active === item ? "page" : undefined}
            className={linkFocus}
          >
            <RailItem item={item} active={active === item} />
          </Link>
        ))}
      </nav>
      <div className="mt-auto">{profile}</div>
    </aside>
  );
}

const barLeft: NavKey[] = ["home", "budget"];
const barRight: NavKey[] = ["debts", "accounts"];

export function BottomBar() {
  const t = useT("nav");
  const { open } = useEntrySheet();
  const active = useActive([...barLeft, ...barRight]);

  const link = (item: NavKey) => (
    <Link
      key={item}
      href={destinations[item].href}
      aria-current={active === item ? "page" : undefined}
      className={cn(linkFocus, "min-w-0 flex-1 rounded-[16px]")}
    >
      <BarItem item={item} active={active === item} />
    </Link>
  );

  return (
    <div className="from-canvas to-canvas/0 pointer-events-none fixed inset-x-0 bottom-0 z-10 bg-gradient-to-t from-55% px-3 pt-[22px] pb-[max(12px,env(safe-area-inset-bottom))] md:hidden">
      <nav
        aria-label={t("label")}
        className="bg-surface pointer-events-auto mx-auto flex w-full max-w-[560px] items-center gap-0.5 rounded-[22px] border border-[#e6e0d4] p-1.5 shadow-[0_6px_20px_rgba(42,40,37,0.08)]"
      >
        {barLeft.map(link)}
        <button
          type="button"
          onClick={() => open()}
          aria-label={t("newEntry")}
          className="group flex flex-1 cursor-pointer justify-center focus-visible:outline-none"
        >
          <span className="bg-primary border-canvas group-focus-visible:outline-primary -mt-[30px] flex h-14 w-14 items-center justify-center rounded-[18px] border-4 text-white shadow-[0_10px_20px_-8px_rgba(61,95,57,0.7)] group-focus-visible:outline-2 group-focus-visible:outline-offset-2">
            <Plus className="h-7 w-7" strokeWidth={2.4} />
          </span>
        </button>
        {barRight.map(link)}
      </nav>
    </div>
  );
}
