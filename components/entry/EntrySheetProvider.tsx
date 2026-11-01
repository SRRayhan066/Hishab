"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { DebtKind } from "@/lib/finance/debts";

export type EntryType = "spend" | "debt" | "transfer";

export type EntryPreset = {
  type: EntryType;
  kind?: DebtKind;
  personId?: string;
};

type EntrySheetValue = {
  preset: EntryPreset | null;
  open: (preset?: EntryPreset) => void;
  close: () => void;
};

const EntrySheetContext = createContext<EntrySheetValue>({
  preset: null,
  open: () => {},
  close: () => {},
});

export function useEntrySheet() {
  return useContext(EntrySheetContext);
}

export function EntrySheetProvider({ children }: { children: ReactNode }) {
  const [preset, setPreset] = useState<EntryPreset | null>(null);
  const open = useCallback(
    (next: EntryPreset = { type: "spend" }) => setPreset(next),
    [],
  );
  const close = useCallback(() => setPreset(null), []);
  const value = useMemo(() => ({ preset, open, close }), [preset, open, close]);

  return <EntrySheetContext value={value}>{children}</EntrySheetContext>;
}
