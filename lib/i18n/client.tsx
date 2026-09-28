"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Locale } from "./config";
import { createFormat } from "./format";
import { createT, type Messages, type Namespace } from "./translate";

type I18nValue = { locale: Locale; messages: Messages };

const I18nContext = createContext<I18nValue | null>(null);

type I18nClientProviderProps = I18nValue & { children: ReactNode };

export function I18nClientProvider({
  locale,
  messages,
  children,
}: I18nClientProviderProps) {
  const parent = useContext(I18nContext);
  const value = useMemo(
    () => ({ locale, messages: { ...parent?.messages, ...messages } }),
    [locale, messages, parent],
  );

  return <I18nContext value={value}>{children}</I18nContext>;
}

function useI18n() {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n needs an I18nProvider above it");
  return value;
}

export function useLocale() {
  return useI18n().locale;
}

export function useT<N extends Namespace>(namespace: N) {
  const section = useI18n().messages[namespace];
  if (!section) throw new Error(`No "${namespace}" messages were provided`);
  return useMemo(() => createT<N>(section), [section]);
}

export function useFormat() {
  const locale = useLocale();
  return useMemo(() => createFormat(locale), [locale]);
}
