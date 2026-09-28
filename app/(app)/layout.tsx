import type { ReactNode } from "react";
import { AppShell } from "@/components/app/AppShell";
import { I18nProvider } from "@/lib/i18n/provider";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <I18nProvider
      namespaces={[
        "nav",
        "titles",
        "header",
        "language",
        "validation",
        "home",
        "add",
        "budget",
        "accounts",
        "profile",
        "install",
      ]}
    >
      <AppShell>{children}</AppShell>
    </I18nProvider>
  );
}
