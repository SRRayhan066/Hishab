"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type RetryNoticeProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/**
 * What the user sees when a screen throws.
 *
 * Nearly every error that reaches here is a database connection that died
 * between requests, and re-running the render fixes it — so this retries once
 * on its own rather than showing a dead end and asking the user to work out
 * that a reload would help. Only if that retry fails too does it say anything.
 */
export function RetryNotice({ error, reset }: RetryNoticeProps) {
  const [retrying, setRetrying] = useState(true);
  // React remounts this boundary on every failed `reset`, but the ref survives
  // that remount — without it a permanently broken screen would retry forever.
  const retried = useRef(false);

  useEffect(() => {
    console.error("[screen] render failed", error);

    if (retried.current) {
      setRetrying(false);
      return;
    }

    retried.current = true;
    const timer = setTimeout(reset, 400);
    return () => clearTimeout(timer);
  }, [error, reset]);

  if (retrying) {
    return (
      <Card className="px-6 py-12 text-center" aria-busy>
        <p className="text-ink-muted text-[15px]">আবার চেষ্টা করা হচ্ছে…</p>
      </Card>
    );
  }

  return (
    <Card className="px-6 py-10 text-center">
      <p className="font-display text-[19px] font-bold">একটু সমস্যা হয়েছে</p>
      <p className="text-ink-muted mx-auto mt-2 max-w-[320px] text-[15px]">
        তথ্য আনতে গিয়ে সংযোগে ঝামেলা হয়েছে। আবার চেষ্টা করুন।
      </p>
      <Button
        variant="outline"
        className="mt-6 w-full max-w-[240px]"
        onClick={() => {
          retried.current = false;
          setRetrying(true);
          reset();
        }}
      >
        আবার চেষ্টা করুন
      </Button>
    </Card>
  );
}
