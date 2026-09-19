"use client";

import { useEffect, useId, useRef, useState } from "react";
import { UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { SignOutButton } from "./SignOutButton";

/**
 * Signing out is rare and destructive, so it lives behind the account button
 * instead of sitting in the header as the loudest thing on every screen.
 */
export function AccountMenu() {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-label="অ্যাকাউন্ট"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "border-line-soft text-ink-soft focus-visible:outline-primary flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
          open ? "bg-field-alt" : "bg-surface hover:bg-field-alt",
        )}
      >
        <UserRound className="h-5 w-5" />
      </button>

      <div
        id={panelId}
        hidden={!open}
        className="bg-surface border-line-soft absolute top-full right-0 z-20 mt-2 w-52 rounded-[16px] border p-1.5 shadow-[0_10px_30px_rgba(42,40,37,0.12)]"
      >
        <SignOutButton />
      </div>
    </div>
  );
}
