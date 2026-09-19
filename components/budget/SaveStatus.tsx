"use client";

import { Check, LoaderCircle, TriangleAlert } from "lucide-react";

export type SaveState = "idle" | "saving" | "saved" | "error";

type SaveStatusProps = {
  state: SaveState;
  error: string;
  /** Unsaved edits are waiting — worth saying out loud, not just greying a button. */
  dirty?: boolean;
};

export function SaveStatus({ state, error, dirty = false }: SaveStatusProps) {
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
        সেভ হচ্ছে
      </p>
    );
  }

  if (dirty) {
    return (
      <p className="text-ink-muted flex items-center gap-1.5 text-[14px] font-medium">
        সেভ করা হয়নি
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
        সেভ হয়েছে
      </p>
    );
  }

  return null;
}
