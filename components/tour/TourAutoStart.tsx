"use client";

import { useEffect } from "react";
import { useTour } from "./TourProvider";

export function TourAutoStart() {
  const { startFirstRun } = useTour();

  useEffect(() => {
    startFirstRun();
  }, [startFirstRun]);

  return null;
}
