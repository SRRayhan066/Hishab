"use client";

import {
  useEffect,
  useLayoutEffect,
  useState,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { useFormat, useT } from "@/lib/i18n/client";
import { tourSteps, tourTarget } from "@/lib/tour/steps";

type Found = { index: number; element: Element | null };

type Frame = {
  element: Element;
  top: number;
  left: number;
  width: number;
  height: number;
  vw: number;
  vh: number;
};

type TourOverlayProps = {
  index: number;
  onMove: (index: number) => void;
  onClose: () => void;
};

const pad = 8;
const gap = 12;
const gutter = 16;
const cardWidth = 360;
const cardRoom = 230;
const waitLimit = 6000;
const dim = "rgba(42,40,37,0.55)";

function findVisible(selector: string) {
  return (
    Array.from(document.querySelectorAll(selector)).find(
      (element) => element.getClientRects().length > 0,
    ) ?? null
  );
}

function bringIntoView(element: Element) {
  const box = element.getBoundingClientRect();
  if (box.top >= gutter && box.bottom <= window.innerHeight - gutter) return;

  element.scrollIntoView({
    block: box.height > window.innerHeight * 0.6 ? "start" : "center",
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth",
  });
}

function placeCard(frame: Frame): CSSProperties {
  const narrow = frame.vw < 640;
  const width = narrow ? frame.vw - gutter * 2 : cardWidth;
  const left = narrow
    ? gutter
    : Math.min(
        Math.max(frame.left + frame.width / 2 - width / 2, gutter),
        frame.vw - gutter - width,
      );

  const spotBottom = frame.top + frame.height + pad;
  const spotTop = frame.top - pad;
  const below = frame.vh - spotBottom;
  const above = spotTop;

  if (Math.max(below, above) < cardRoom) {
    return {
      left,
      width,
      bottom: `calc(${gutter}px + env(safe-area-inset-bottom))`,
    };
  }

  return below >= above
    ? { left, width, top: spotBottom + gap }
    : { left, width, bottom: frame.vh - spotTop + gap };
}

export function TourOverlay({ index, onMove, onClose }: TourOverlayProps) {
  const step = tourSteps[index];
  const first = index === 0;
  const last = index === tourSteps.length - 1;

  const router = useRouter();
  const pathname = usePathname();
  const t = useT("tour");
  const format = useFormat();

  const [found, setFound] = useState<Found | null>(null);
  const [frame, setFrame] = useState<Frame | null>(null);

  const current = found?.index === index ? found : null;
  const element = current?.element ?? null;
  const spot = element && frame?.element === element ? frame : null;
  const ready = current !== null && (element === null || spot !== null);

  useLayoutEffect(() => {
    if (pathname !== step.route) {
      router.push(step.route);
      return;
    }

    if (step.centered) {
      setFound({ index, element: null });
      return;
    }

    const selector = tourTarget(step.id);
    const settle = (target: Element | null) => {
      if (target) bringIntoView(target);
      setFound({ index, element: target });
    };

    const existing = findVisible(selector);
    if (existing) {
      settle(existing);
      return;
    }

    const observer = new MutationObserver(() => {
      const target = findVisible(selector);
      if (!target) return;
      observer.disconnect();
      window.clearTimeout(timer);
      settle(target);
    });
    observer.observe(document.body, { childList: true, subtree: true });

    const timer = window.setTimeout(() => {
      observer.disconnect();
      settle(null);
    }, waitLimit);

    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [index, step, pathname, router]);

  useLayoutEffect(() => {
    if (!element) return;

    let frameId = 0;
    let previous = "";

    const track = () => {
      const box = element.getBoundingClientRect();
      const next = {
        top: box.top,
        left: box.left,
        width: box.width,
        height: box.height,
        vw: document.documentElement.clientWidth,
        vh: window.innerHeight,
      };
      const key = Object.values(next).join();
      if (key !== previous) {
        previous = key;
        setFrame({ element, ...next });
      }
      frameId = requestAnimationFrame(track);
    };

    track();
    return () => cancelAnimationFrame(frameId);
  }, [element]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      else if (event.key === "ArrowRight") {
        if (last) onClose();
        else onMove(index + 1);
      } else if (event.key === "ArrowLeft" && !first) onMove(index - 1);
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [index, first, last, onMove, onClose]);

  const card = ready && (
    <div
      key={index}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-title"
      aria-describedby="tour-body"
      className="bg-surface animate-pop-in pointer-events-auto rounded-[22px] px-5 pt-5 pb-4 shadow-[0_18px_48px_rgba(42,40,37,0.24)]"
      style={spot ? { position: "fixed", ...placeCard(spot) } : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <h2
          id="tour-title"
          className="font-display text-[19px] leading-snug font-bold"
        >
          {t(`${step.id}Title`)}
        </h2>
        {!last && (
          <button
            type="button"
            onClick={onClose}
            className="text-ink-muted hover:text-ink focus-visible:outline-primary -mt-1 -mr-2 flex-none cursor-pointer rounded-full px-2.5 py-1.5 text-[14px] font-semibold transition-colors focus-visible:outline-2"
          >
            {t(first ? "later" : "skip")}
          </button>
        )}
      </div>

      <p id="tour-body" className="text-ink-soft mt-1.5 text-[15px] leading-[1.6]">
        {t(`${step.id}Body`)}
      </p>

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="text-ink-muted text-[13px] font-semibold">
          {t("progress", {
            current: format.digits(index + 1),
            total: format.digits(tourSteps.length),
          })}
        </span>

        <div className="flex items-center gap-1.5">
          {!first && (
            <button
              type="button"
              onClick={() => onMove(index - 1)}
              className="text-ink-soft hover:bg-field-alt focus-visible:outline-primary min-h-11 cursor-pointer rounded-full px-4 text-[15px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {t("back")}
            </button>
          )}
          <button
            type="button"
            autoFocus
            onClick={() => (last ? onClose() : onMove(index + 1))}
            className="bg-primary hover:bg-primary-dark font-display focus-visible:outline-primary min-h-11 cursor-pointer rounded-full px-5 text-[15px] font-bold text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {t(first ? "start" : last ? "finish" : "next")}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[100]">
      {spot ? (
        <div
          aria-hidden
          className="pointer-events-none fixed rounded-[24px]"
          style={{
            top: spot.top - pad,
            left: spot.left - pad,
            width: spot.width + pad * 2,
            height: spot.height + pad * 2,
            boxShadow: `0 0 0 2px rgba(255,255,255,0.75), 0 0 0 9999px ${dim}`,
          }}
        />
      ) : (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0"
          style={{ background: dim }}
        />
      )}

      {spot ? (
        card
      ) : (
        <div className="pointer-events-none fixed inset-0 flex items-center justify-center p-4">
          <div className="w-full max-w-[380px]">{card}</div>
        </div>
      )}
    </div>,
    document.body,
  );
}
