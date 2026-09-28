"use client";

import { useSyncExternalStore } from "react";

type InstallChoice = { outcome: "accepted" | "dismissed"; platform: string };

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<InstallChoice>;
};

declare global {
  interface Window {
    __installPrompt?: BeforeInstallPromptEvent | null;
    __appInstalled?: boolean;
  }
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
  interface Navigator {
    standalone?: boolean;
  }
}

export type InstallStatus = "hidden" | "prompt" | "ios";

const dismissedKey = "hishabi:install-dismissed-at";
const snoozeDays = 14;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function isIos() {
  const { userAgent, platform, maxTouchPoints } = navigator;
  return (
    /iPhone|iPad|iPod/i.test(userAgent) ||
    (platform === "MacIntel" && maxTouchPoints > 1)
  );
}

function isMobile() {
  return isIos() || /Android|Mobile/i.test(navigator.userAgent);
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    navigator.standalone === true ||
    window.__appInstalled === true
  );
}

function readDismissedAt() {
  try {
    return Number(localStorage.getItem(dismissedKey)) || 0;
  } catch {
    return 0;
  }
}

let dismissedThisVisit = false;

function isSnoozed() {
  if (dismissedThisVisit) return true;
  const snoozeMs = snoozeDays * 24 * 60 * 60 * 1000;
  return Date.now() - readDismissedAt() < snoozeMs;
}

function getSnapshot(): InstallStatus {
  if (isStandalone() || !isMobile() || isSnoozed()) return "hidden";
  if (window.__installPrompt) return "prompt";
  if (isIos()) return "ios";
  return "hidden";
}

function getServerSnapshot(): InstallStatus {
  return "hidden";
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const displayMode = window.matchMedia("(display-mode: standalone)");
  window.addEventListener("beforeinstallprompt", notify);
  window.addEventListener("appinstalled", notify);
  displayMode.addEventListener("change", notify);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("beforeinstallprompt", notify);
    window.removeEventListener("appinstalled", notify);
    displayMode.removeEventListener("change", notify);
  };
}

export function useInstallStatus() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function dismissInstall() {
  dismissedThisVisit = true;
  try {
    localStorage.setItem(dismissedKey, String(Date.now()));
  } catch {}
  notify();
}

export async function promptInstall() {
  const deferred = window.__installPrompt;
  if (!deferred) return;
  window.__installPrompt = null;
  await deferred.prompt();
  const choice = await deferred.userChoice;
  if (choice.outcome === "accepted") {
    window.__appInstalled = true;
    notify();
  } else {
    dismissInstall();
  }
}
