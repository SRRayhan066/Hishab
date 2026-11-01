"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeftRight, ChevronLeft, Plus } from "lucide-react";
import { useEntrySheet } from "@/components/entry/EntrySheetProvider";
import { useT } from "@/lib/i18n/client";
import type { Dictionary } from "@/lib/i18n/dictionaries/bn";
import { cn } from "@/lib/utils";

type Screen = {
  title?: keyof Dictionary["titles"];
  month?: boolean;
  back?: { href: string; label: keyof Dictionary["nav"] | "profile"; phoneOnly?: boolean };
};

const screens: Record<string, Screen> = {
  "/home": { title: "home", month: true },
  "/spending": {
    title: "spending",
    month: true,
    back: { href: "/home", label: "home", phoneOnly: true },
  },
  "/budget": { title: "budget", month: true },
  "/history": {
    title: "history",
    back: { href: "/budget", label: "budget", phoneOnly: true },
  },
  "/accounts": { title: "accounts", month: true },
  "/debts": { title: "debts" },
  "/profile": { title: "profile" },
  "/profile/name": {
    title: "profileName",
    back: { href: "/profile", label: "profile" },
  },
  "/profile/password": {
    title: "profilePassword",
    back: { href: "/profile", label: "profile" },
  },
  "/profile/currency": {
    title: "profileCurrency",
    back: { href: "/profile", label: "profile" },
  },
  "/profile/delete": {
    title: "profileDelete",
    back: { href: "/profile", label: "profile" },
  },
};

const personScreen: Screen = { back: { href: "/debts", label: "debts" } };

export function ScreenHeader({
  month,
  banner,
  avatar,
}: {
  month: ReactNode;
  banner: ReactNode;
  avatar: ReactNode;
}) {
  const pathname = usePathname();
  const nav = useT("nav");
  const titles = useT("titles");
  const header = useT("header");
  const entry = useT("entry");
  const debts = useT("debts");
  const { open } = useEntrySheet();
  const screen =
    screens[pathname] ?? (pathname.startsWith("/debts/") ? personScreen : {});
  const backLabel =
    screen.back?.label === "profile"
      ? header("profile")
      : screen.back && nav(screen.back.label);

  return (
    <>
      <header className="flex items-start justify-between gap-3 pt-1 pb-1.5">
        <div className="grid min-w-0 gap-2">
          {screen.back && (
            <Link
              href={screen.back.href}
              className={cn(
                "text-primary-dark focus-visible:outline-primary -ml-2 flex h-9 w-fit items-center gap-1 rounded-[10px] pr-2.5 pl-1 text-[15px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2",
                screen.back.phoneOnly && "md:hidden",
              )}
            >
              <ChevronLeft className="h-[22px] w-[22px]" />
              {backLabel}
            </Link>
          )}
          {screen.title && (
            <h1 className="font-display text-[27px] leading-[1.2] font-bold tracking-[-0.01em] md:text-[32px]">
              {titles(screen.title)}
            </h1>
          )}
          {screen.month && month}
        </div>

        <div className="flex flex-none items-center gap-2.5">
          {pathname === "/debts" && (
            <button
              type="button"
              onClick={() => open({ type: "debt", kind: "lend" })}
              className={headerAction}
            >
              <Plus className="h-5 w-5" />
              {debts("new")}
            </button>
          )}
          {pathname === "/accounts" && (
            <button
              type="button"
              onClick={() => open({ type: "transfer" })}
              className={cn(headerAction, "hidden md:flex")}
            >
              <ArrowLeftRight className="h-5 w-5" />
              {entry("titleTransfer")}
            </button>
          )}
          {!pathname.startsWith("/profile") && (
            <Link
              href="/profile"
              aria-label={header("profile")}
              className="focus-visible:outline-primary h-11 w-11 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 md:hidden"
            >
              {avatar}
            </Link>
          )}
        </div>
      </header>
      {screen.month && banner}
    </>
  );
}

const headerAction =
  "bg-ink focus-visible:outline-primary flex h-11 cursor-pointer items-center gap-1.5 rounded-[12px] pr-4 pl-3 text-[15px] font-semibold whitespace-nowrap text-white focus-visible:outline-2 focus-visible:outline-offset-2";
