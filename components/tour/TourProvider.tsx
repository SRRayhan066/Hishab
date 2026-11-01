"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { viewMonth } from "@/app/actions/month";
import { completeTour } from "@/app/actions/tour";
import { Sheet } from "@/components/ui/Sheet";
import { useFormat, useT } from "@/lib/i18n/client";
import { tourSteps } from "@/lib/tour/steps";
import { cn } from "@/lib/utils";

type TourValue = {
  active: boolean;
  start: () => void;
  startFirstRun: () => void;
};

const TourContext = createContext<TourValue>({
  active: false,
  start: () => {},
  startFirstRun: () => {},
});

export function useTour() {
  return useContext(TourContext);
}

export function TourProvider({ children }: { children: ReactNode }) {
  const [index, setIndex] = useState<number | null>(null);
  const firstRun = useRef<"idle" | "running" | "done">("idle");
  const active = index !== null;

  const start = useCallback(() => {
    setIndex(0);
    void viewMonth(null);
  }, []);

  const startFirstRun = useCallback(() => {
    if (firstRun.current !== "idle") return;
    firstRun.current = "running";
    setIndex(0);
  }, []);

  const close = useCallback(() => {
    setIndex(null);
    if (firstRun.current !== "running") return;
    firstRun.current = "done";
    void completeTour();
  }, []);

  const value = useMemo(
    () => ({ active, start, startFirstRun }),
    [active, start, startFirstRun],
  );

  return (
    <TourContext value={value}>
      {children}
      {index !== null && (
        <TourSheet index={index} onMove={setIndex} onClose={close} />
      )}
    </TourContext>
  );
}

function TourSheet({
  index,
  onMove,
  onClose,
}: {
  index: number;
  onMove: (index: number) => void;
  onClose: () => void;
}) {
  const t = useT("tour");
  const format = useFormat();
  const step = tourSteps[index];
  const last = index === tourSteps.length - 1;

  return (
    <Sheet card label={t(`${step}Title`)} onClose={onClose}>
      <div className="grid gap-3.5">
        <span className="text-primary-dark text-[13px] font-semibold">
          {t("step", {
            current: format.digits(index + 1),
            total: format.digits(tourSteps.length),
          })}
        </span>
        <h2 className="font-display text-[22px] leading-[1.3] font-bold">
          {t(`${step}Title`)}
        </h2>
        <p className="text-ink-soft text-[15px] leading-[1.6]">
          {t(`${step}Body`)}
        </p>
        <div aria-hidden className="flex gap-1.5">
          {tourSteps.map((name, position) => (
            <span
              key={name}
              className={cn(
                "h-1.5 rounded-full transition-all",
                position === index ? "w-5" : "w-1.5",
                position <= index ? "bg-primary" : "bg-line",
              )}
            />
          ))}
        </div>
        <div className="flex justify-between gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="text-ink-soft focus-visible:outline-primary h-[46px] cursor-pointer rounded-[12px] px-3.5 text-[15px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {t("skip")}
          </button>
          <button
            type="button"
            autoFocus
            onClick={() => (last ? onClose() : onMove(index + 1))}
            className="bg-primary hover:bg-primary-dark font-display focus-visible:outline-primary h-[46px] cursor-pointer rounded-[12px] px-[22px] text-[16px] font-bold text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {t(last ? "done" : "next")}
          </button>
        </div>
      </div>
    </Sheet>
  );
}
