"use client";

import { Share, X } from "lucide-react";
import { useTour } from "@/components/tour/TourProvider";
import { useT } from "@/lib/i18n/client";
import { dismissInstall, promptInstall, useInstallStatus } from "@/lib/pwa/install";

export function InstallBanner() {
  const status = useInstallStatus();
  const t = useT("install");
  const tour = useTour();

  if (status === "hidden" || tour.active) return null;

  const [beforeShare, afterShare] = t("iosHint").split("{share}");

  return (
    <aside className="bg-panel text-ink-panel animate-pop-in flex items-center gap-3 rounded-[18px] py-3 pr-2 pl-3">
      <span
        aria-hidden
        className="bg-primary font-display flex h-10 w-10 flex-none items-center justify-center rounded-[12px] text-[21px] font-bold text-white"
      >
        ৳
      </span>

      <div className="min-w-0 flex-1">
        <p className="font-display text-ink text-[15px] leading-tight font-bold">
          {t("title")}
        </p>
        <p className="mt-0.5 text-[13px] leading-snug">
          {status === "ios" ? (
            <>
              {beforeShare}
              <Share
                aria-hidden
                className="text-primary mx-0.5 inline h-[15px] w-[15px] -translate-y-px"
              />
              {afterShare}
            </>
          ) : (
            t("body")
          )}
        </p>
      </div>

      {status === "prompt" && (
        <button
          type="button"
          onClick={promptInstall}
          className="bg-primary hover:bg-primary-dark font-display focus-visible:outline-primary h-9 flex-none cursor-pointer rounded-full px-4 text-[14px] font-bold text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          {t("install")}
        </button>
      )}

      <button
        type="button"
        onClick={dismissInstall}
        aria-label={t("close")}
        title={t("close")}
        className="text-ink-muted hover:text-ink focus-visible:outline-primary flex h-9 w-9 flex-none cursor-pointer items-center justify-center rounded-full transition-colors focus-visible:outline-2"
      >
        <X className="h-[18px] w-[18px]" />
      </button>
    </aside>
  );
}
