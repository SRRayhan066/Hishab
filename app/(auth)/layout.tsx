import type { ReactNode } from "react";
import { LanguageSwitcher } from "@/components/app/LanguageSwitcher";
import { I18nProvider } from "@/lib/i18n/provider";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <I18nProvider namespaces={["auth", "validation", "language"]}>
      <div className="flex justify-end px-[18px] pt-4">
        <LanguageSwitcher />
      </div>
      {children}
    </I18nProvider>
  );
}
