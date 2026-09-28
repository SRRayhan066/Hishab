"use client";

import { Compass } from "lucide-react";
import { useTour } from "@/components/tour/TourProvider";
import { Card } from "@/components/ui/Card";
import { useT } from "@/lib/i18n/client";

export function TourCard() {
  const t = useT("tour");
  const tour = useTour();

  return (
    <Card
      data-tour="profile"
      className="flex flex-col gap-4 px-[22px] pt-[22px] pb-6 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <h2 className="font-display text-[18px] font-bold">
          {t("replayTitle")}
        </h2>
        <p className="text-ink-muted mt-0.5 text-[14px] leading-[1.55]">
          {t("replayHint")}
        </p>
      </div>
      <button
        type="button"
        onClick={tour.start}
        className="bg-panel text-primary-dark hover:bg-[#dde8d7] focus-visible:outline-primary flex min-h-[50px] w-full flex-none cursor-pointer items-center justify-center gap-2 rounded-[12px] px-5 text-[16px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 sm:w-auto"
      >
        <Compass className="h-4 w-4" />
        {t("replay")}
      </button>
    </Card>
  );
}
