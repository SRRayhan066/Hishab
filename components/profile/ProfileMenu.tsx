"use client";

import { useOptimistic, useTransition, type ReactNode } from "react";
import Link from "next/link";
import {
  Banknote,
  ChevronRight,
  Compass,
  KeyRound,
  Languages,
  LogOut,
  Trash2,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { changeLocale } from "@/app/actions/locale";
import { useTour } from "@/components/tour/TourProvider";
import { localeNames } from "@/lib/i18n/config";
import { useFormat, useLocale, useT } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

const rowClass =
  "focus-visible:outline-primary flex min-h-14 w-full cursor-pointer items-center gap-3 border-t border-[#f4f0e7] py-2 text-left first:border-t-0 focus-visible:outline-2 focus-visible:outline-offset-2";

function RowBody({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value?: string;
}) {
  return (
    <>
      <Icon className="h-[21px] w-[21px] flex-none" />
      <span className="flex-1 text-[15px] font-semibold">{label}</span>
      {value && <span className="text-ink-soft text-[14px]">{value}</span>}
      <ChevronRight className="text-ink-muted h-5 w-5 flex-none" />
    </>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="grid gap-2">
      <span className="text-ink-soft px-1 text-[13px] font-semibold tracking-[0.04em]">
        {title}
      </span>
      <section className="bg-surface border-line-soft grid rounded-[20px] border px-[18px] shadow-[0_2px_4px_rgba(42,40,37,0.03)]">
        {children}
      </section>
    </div>
  );
}

export function ProfileMenu() {
  const t = useT("profile");
  const common = useT("common");
  const format = useFormat();
  const tour = useTour();
  const locale = useLocale();
  const [shownLocale, setShownLocale] = useOptimistic(locale);
  const [busy, startTransition] = useTransition();

  const toggleLanguage = () => {
    const next = shownLocale === "bn" ? "en" : "bn";
    startTransition(async () => {
      setShownLocale(next);
      await changeLocale(next);
    });
  };

  return (
    <div className="grid gap-4">
      <Group title={t("groupAccount")}>
        <Link href="/profile/name" className={rowClass}>
          <RowBody icon={UserRound} label={t("rowName")} />
        </Link>
        <Link href="/profile/password" className={rowClass}>
          <RowBody icon={KeyRound} label={t("rowPassword")} />
        </Link>
      </Group>

      <Group title={t("groupPreferences")}>
        <Link href="/profile/currency" className={rowClass}>
          <RowBody
            icon={Banknote}
            label={t("rowCurrency")}
            value={`${format.currency} · ${format.symbol}`}
          />
        </Link>
        <button
          type="button"
          disabled={busy}
          onClick={toggleLanguage}
          className={cn(rowClass, "disabled:cursor-wait")}
        >
          <RowBody
            icon={Languages}
            label={t("rowLanguage")}
            value={localeNames[shownLocale]}
          />
        </button>
        <button type="button" onClick={tour.start} className={rowClass}>
          <RowBody icon={Compass} label={t("rowTour")} />
        </button>
      </Group>

      <Group title={t("groupData")}>
        <Link href="/profile/delete" className={cn(rowClass, "text-danger")}>
          <RowBody icon={Trash2} label={t("rowDelete")} />
        </Link>
        <form action={signOut} className="contents">
          <button type="submit" className={rowClass}>
            <RowBody icon={LogOut} label={common("signOut")} />
          </button>
        </form>
      </Group>
    </div>
  );
}
