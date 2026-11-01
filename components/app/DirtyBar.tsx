"use client";

import { PencilLine } from "lucide-react";
import { useFormat, useT } from "@/lib/i18n/client";

export function DirtyBar({
  count,
  busy,
  onDiscard,
  onSave,
}: {
  count: number;
  busy: boolean;
  onDiscard: () => void;
  onSave: () => void;
}) {
  const t = useT("common");
  const format = useFormat();

  return (
    <>
      <div aria-hidden className="h-[70px]" />
      <div className="pointer-events-none fixed inset-x-3 bottom-[calc(92px+max(12px,env(safe-area-inset-bottom)))] z-20 md:right-3 md:bottom-4 md:left-[104px] xl:left-[256px]">
        <div className="bg-ink animate-pop-in pointer-events-auto mx-auto flex w-full max-w-[560px] items-center justify-between gap-3 rounded-[16px] py-2 pr-2 pl-4 text-white shadow-[0_10px_30px_rgba(42,40,37,0.25)]">
          <span aria-live="polite" className="flex min-w-0 items-center gap-2 text-[15px] font-medium">
            <PencilLine className="h-[18px] w-[18px] flex-none" />
            <span className="truncate">
              {t(count === 1 ? "unsavedOne" : "unsavedMany", {
                count: format.number(count),
              })}
            </span>
          </span>
          <span className="flex flex-none gap-1">
            <button
              type="button"
              onClick={onDiscard}
              disabled={busy}
              className="h-10 cursor-pointer rounded-[11px] px-3 text-[15px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-wait disabled:opacity-60"
            >
              {t("discard")}
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={busy}
              className="bg-surface text-ink font-display h-10 cursor-pointer rounded-[11px] px-4 text-[16px] font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-wait disabled:opacity-60"
            >
              {busy ? t("saving") : t("save")}
            </button>
          </span>
        </div>
      </div>
    </>
  );
}
