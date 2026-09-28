import type { Metadata } from "next";
import { AuthScreen } from "@/components/auth/AuthScreen";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("meta");
  return {
    title: t("loginTitle"),
    description: t("loginDescription"),
  };
}

const notices = {
  google: "googleFailed",
  "google-unverified": "googleUnverified",
  "google-expired": "googleExpired",
} as const;

function isNotice(value: unknown): value is keyof typeof notices {
  return typeof value === "string" && Object.hasOwn(notices, value);
}

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const [{ error }, t] = await Promise.all([searchParams, getT("errors")]);
  const notice = isNotice(error) ? t(notices[error]) : undefined;

  return <AuthScreen notice={notice} />;
}
