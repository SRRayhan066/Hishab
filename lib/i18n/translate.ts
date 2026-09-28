import type { Dictionary } from "./dictionaries/bn";

export type Namespace = keyof Dictionary;
export type Messages = Partial<Dictionary>;
export type TranslationValues = Record<string, string | number>;

export function interpolate(template: string, values?: TranslationValues) {
  if (!values) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

export function createT<N extends Namespace>(messages: Dictionary[N]) {
  return (key: keyof Dictionary[N], values?: TranslationValues) =>
    interpolate(messages[key] as string, values);
}

export type Translator<N extends Namespace> = ReturnType<typeof createT<N>>;
