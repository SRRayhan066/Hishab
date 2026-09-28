"use client";

import { useState, useTransition } from "react";
import { Lock, UserRound } from "lucide-react";
import { updateName } from "@/app/actions/profile";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { requestFailedError } from "@/lib/auth/messages";
import { profileNameSchema } from "@/lib/validation/profile";

export function NameCard({ name, email }: { name: string; email: string }) {
  const [value, setValue] = useState(name);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, startTransition] = useTransition();
  const changed = value.trim() !== name;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const parsed = profileNameSchema.safeParse({ name: value });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "");
      return;
    }

    setError("");
    setDone(false);
    startTransition(async () => {
      try {
        const result = await updateName(parsed.data);
        if (result.error) {
          setError(result.error);
          return;
        }
        setValue(parsed.data.name);
        setDone(true);
      } catch {
        setError(requestFailedError);
      }
    });
  };

  return (
    <Card className="px-[22px] pt-[22px] pb-6">
      <form onSubmit={handleSubmit} noValidate>
        <h2 className="font-display text-[18px] font-bold">তোমার পরিচয়</h2>
        <p className="text-ink-muted mt-0.5 text-[14px] leading-[1.55]">
          অ্যাপে এই নামেই তোমাকে ডাকা হবে।
        </p>

        <div className="mt-4 flex flex-col gap-4">
          <Input
            label="নাম"
            value={value}
            error={error}
            maxLength={60}
            onChange={(event) => {
              setValue(event.target.value);
              setError("");
              setDone(false);
            }}
            autoComplete="name"
            leading={<UserRound className="text-ink-faint h-4 w-4 flex-none" />}
          />

          <div className="flex flex-col gap-[7px]">
            <span className="text-ink-soft text-[14px] font-semibold">ইমেইল</span>
            <div className="bg-field-alt border-line-soft rounded-field text-ink-muted flex min-h-[50px] items-center gap-2 border-[1.5px] px-[15px] text-[16px]">
              <span className="min-w-0 flex-1 truncate">{email}</span>
              <Lock className="text-ink-faint h-4 w-4 flex-none" />
            </div>
            <p className="text-ink-faint text-[13px]">ইমেইল বদলানো যায় না।</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={!changed || busy}
          className="bg-ink font-display focus-visible:outline-primary mt-5 min-h-[50px] w-full cursor-pointer rounded-[12px] px-4 text-[16px] font-bold text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy ? "সেভ হচ্ছে…" : "নাম সেভ করো"}
        </button>

        {done && (
          <p aria-live="polite" className="text-primary-dark mt-3 text-center text-[14px] font-medium">
            নাম সেভ হয়েছে।
          </p>
        )}
      </form>
    </Card>
  );
}
