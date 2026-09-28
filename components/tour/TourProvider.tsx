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
import { completeTour } from "@/app/actions/tour";
import { TourOverlay } from "./TourOverlay";

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

  const start = useCallback(() => setIndex(0), []);

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
      <div inert={active} className="contents">
        {children}
      </div>
      {index !== null && (
        <TourOverlay index={index} onMove={setIndex} onClose={close} />
      )}
    </TourContext>
  );
}
