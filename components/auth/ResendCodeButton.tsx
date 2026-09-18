"use client";

import { useEffect, useState, useTransition } from "react";
import { resendPasswordResetCode } from "@/app/actions/password-reset";
import { requestFailedError } from "@/lib/auth/messages";
import { cn } from "@/lib/utils";

type Status = { tone: "info" | "error"; text: string };

type ResendCodeButtonProps = {
  initialSeconds: number;
  cooldownSeconds: number;
};

export function ResendCodeButton({
  initialSeconds,
  cooldownSeconds,
}: ResendCodeButtonProps) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [status, setStatus] = useState<Status | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const handleClick = () => {
    setStatus(null);
    startTransition(async () => {
      try {
        const result = await resendPasswordResetCode();
        if (result.error) {
          setStatus({ tone: "error", text: result.error });
          return;
        }
        setSecondsLeft(cooldownSeconds);
        setStatus({ tone: "info", text: "নতুন কোড পাঠানো হয়েছে।" });
      } catch {
        setStatus({ tone: "error", text: requestFailedError });
      }
    });
  };

  const waiting = secondsLeft > 0;

  return (
    <div className="flex flex-col items-center gap-[6px] text-center">
      <p className="text-ink-muted text-[14px]">
        কোড আসেনি? স্প্যাম ফোল্ডারটাও দেখো।
      </p>
      <button
        type="button"
        onClick={handleClick}
        disabled={waiting || pending}
        className={cn(
          "focus-visible:outline-primary cursor-pointer rounded-sm text-[15px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed",
          waiting || pending
            ? "text-ink-faint"
            : "text-primary hover:text-primary-dark",
        )}
      >
        {pending
          ? "পাঠানো হচ্ছে…"
          : waiting
            ? `আবার পাঠাও (${secondsLeft.toLocaleString("bn-BD")} সেকেন্ড)`
            : "আবার পাঠাও"}
      </button>
      {status && (
        <p
          role="status"
          className={cn(
            "text-[14px] font-medium",
            status.tone === "error" ? "text-danger" : "text-primary",
          )}
        >
          {status.text}
        </p>
      )}
    </div>
  );
}
