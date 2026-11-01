import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { getCurrentUser } from "@/lib/auth/session";
import { currentPeriod } from "@/lib/finance/period";
import { getMonthView } from "@/lib/finance/view";
import { getT } from "@/lib/i18n/server";
import { MonthPicker } from "./MonthPicker";
import { PastBanner } from "./PastBanner";

/**
 * The header's figures are the only part of the shell that needs the
 * database. They sit behind their own `<Suspense>` boundaries so the rest of
 * the shell — heading, tabs, account button — paints while the query is still
 * running, instead of the whole screen waiting on it.
 */
export async function MonthLine() {
  const [{ daysLabel, months, period }, t] = await Promise.all([
    getMonthView(),
    getT("header"),
  ]);

  return (
    <MonthPicker
      months={months}
      selected={period}
      note={daysLabel || t("readOnly")}
    />
  );
}

export function MonthLineFallback() {
  return <Skeleton className="h-9 w-[220px]" />;
}

export async function MonthBanner() {
  const { summary } = await getMonthView();
  if (!summary.isPast) return null;

  return (
    <PastBanner
      monthIndex={summary.monthIndex}
      year={summary.year}
      currentMonthIndex={currentPeriod().month - 1}
    />
  );
}

export async function ProfileAvatar() {
  const user = await getCurrentUser();
  if (!user) return <ProfileAvatarFallback />;

  return <Avatar seed={user.email} animate="hover" className="h-11 w-11" />;
}

export function ProfileAvatarFallback() {
  return <Skeleton className="h-11 w-11" />;
}

export async function SidebarProfile() {
  const [user, t] = await Promise.all([getCurrentUser(), getT("nav")]);
  if (!user) return null;

  return (
    <Link
      href="/profile"
      className="hover:bg-field-alt focus-visible:outline-primary flex items-center gap-2.5 rounded-[14px] p-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      <Avatar seed={user.email} animate="hover" className="h-[38px] w-[38px]" />
      <span className="grid min-w-0">
        <span className="truncate text-[15px] font-semibold">{user.name}</span>
        <span className="text-ink-soft text-[13px]">{t("profileHint")}</span>
      </span>
    </Link>
  );
}

export async function RailProfile() {
  return (
    <Link
      href="/profile"
      className="focus-visible:outline-primary block rounded-full focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      <ProfileAvatar />
    </Link>
  );
}
