import type { ReactNode } from "react";
import { I18nClientProvider } from "./client";
import { getLocale, pickMessages } from "./server";
import type { Namespace } from "./translate";

type I18nProviderProps = {
  namespaces: Namespace[];
  children: ReactNode;
};

export async function I18nProvider({ namespaces, children }: I18nProviderProps) {
  const [locale, messages] = await Promise.all([
    getLocale(),
    pickMessages(namespaces),
  ]);

  return (
    <I18nClientProvider locale={locale} messages={messages}>
      {children}
    </I18nClientProvider>
  );
}
