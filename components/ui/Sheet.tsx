"use client";

import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from "react";
import { X } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

const DRAG_CLOSE = 110;

type SheetProps = {
  label: string;
  maxWidth?: number;
  card?: boolean;
  onClose: () => void;
  children: ReactNode;
};

export function Sheet({
  label,
  maxWidth = 520,
  card = false,
  onClose,
  children,
}: SheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const dragStart = useRef<number | null>(null);
  const [offset, setOffset] = useState(0);

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const startDrag = (event: PointerEvent<HTMLDivElement>) => {
    dragStart.current = event.clientY;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (dragStart.current === null) return;
    setOffset(Math.max(0, event.clientY - dragStart.current));
  };

  const endDrag = () => {
    if (dragStart.current === null) return;
    dragStart.current = null;
    if (offset > DRAG_CLOSE) onClose();
    else setOffset(0);
  };

  return (
    <dialog
      ref={dialogRef}
      aria-label={label}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
      style={{
        maxWidth: card ? 380 : undefined,
        transform: offset ? `translateY(${offset}px)` : undefined,
        ["--sheet-max" as string]: `${maxWidth}px`,
      }}
      className={cn(
        "bg-surface text-ink backdrop:bg-[rgba(42,40,37,0.42)] shadow-[0_18px_48px_rgba(42,40,37,0.24)] open:flex",
        card
          ? "animate-pop-in m-auto w-[calc(100%-32px)] flex-col rounded-[22px]"
          : "animate-sheet-up md:animate-pop-in mt-auto mb-0 max-h-[calc(100dvh-60px)] w-full max-w-none flex-col rounded-t-[26px] md:m-auto md:max-h-[92dvh] md:w-[calc(100%-80px)] md:max-w-[var(--sheet-max)] md:rounded-[22px]",
      )}
    >
      {!card && (
        <div
          aria-hidden
          onPointerDown={startDrag}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          className="flex h-[26px] flex-none cursor-grab touch-none items-center justify-center md:hidden"
        >
          <span className="h-[5px] w-10 rounded-full bg-[#d8d2c4]" />
        </div>
      )}
      <div
        className={cn(
          "min-h-0 flex-1 overflow-y-auto overscroll-contain",
          card
            ? "px-[26px] pt-6 pb-[26px]"
            : "px-5 pt-1 pb-[max(24px,env(safe-area-inset-bottom))] md:px-[26px] md:pt-6 md:pb-[26px]",
        )}
      >
        {children}
      </div>
    </dialog>
  );
}

export function SheetTitle({
  title,
  onClose,
}: {
  title: string;
  onClose: () => void;
}) {
  const t = useT("common");
  const id = useId();

  return (
    <div className="flex items-center justify-between gap-3">
      <h2
        id={id}
        className="font-display text-[21px] font-bold tracking-[-0.01em]"
      >
        {title}
      </h2>
      <button
        type="button"
        onClick={onClose}
        aria-label={t("close")}
        className="bg-field-alt text-ink-soft focus-visible:outline-primary flex h-11 w-11 flex-none cursor-pointer items-center justify-center rounded-[12px] transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <X className="h-[22px] w-[22px]" />
      </button>
    </div>
  );
}
