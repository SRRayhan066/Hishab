"use client";

import { Check, LoaderCircle, TriangleAlert } from "lucide-react";
import { useT } from "@/lib/i18n/client";

export type SaveState = "idle" | "saving" | "saved" | "error";

type SaveStatusProps = {
  state: SaveState;
  error: string;
  /** Unsaved edits are waiting — worth saying out loud, not just greying a button. */
  dirty?: boolean;
};

export function SaveStatus({ state, error, dirty = false }: SaveStatusProps) {
  const t = useT("budget");

  if (state === "error") {
    return (
      <p
        role="alert"
        className="text-danger flex items-center gap-1.5 text-[14px] font-medium"
      >
        <TriangleAlert className="h-4 w-4 flex-none" />
        {error}
      </p>
    );
  }

  if (state === "saving") {
    return (
      <p
        aria-live="polite"
        className="text-ink-faint flex items-center gap-1.5 text-[14px] font-medium"
      >
        <LoaderCircle className="h-4 w-4 flex-none animate-spin" />
        {t("statusSaving")}
      </p>
    );
  }

  if (dirty) {
    return (
      <p className="text-ink-muted flex items-center gap-1.5 text-[14px] font-medium">
        {t("statusUnsaved")}
      </p>
    );
  }

  if (state === "saved") {
    return (
      <p
        aria-live="polite"
        className="text-ink-faint flex items-center gap-1.5 text-[14px] font-medium"
      >
        <Check className="text-primary h-4 w-4 flex-none" />
        {t("statusSaved")}
      </p>
    );
  }

  return null;
}
