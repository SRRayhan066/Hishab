"use client";

import { useId, useState } from "react";
import {
  ArrowLeftRight,
  CalendarRange,
  Check,
  ReceiptText,
  Trash2,
  TriangleAlert,
  WalletMinimal,
} from "lucide-react";
import { Card } from "@/components/ui/Card";

const phrase = "মুছে ফেলো";

type ClearDataCardProps = {
  monthsTracked: number;
  entries: number;
};

export function ClearDataCard({ monthsTracked, entries }: ClearDataCardProps) {
  const inputId = useId();
  const [confirming, setConfirming] = useState(false);
  const [typed, setTyped] = useState("");
  const ready = typed.trim() === phrase;

  const cancel = () => {
    setConfirming(false);
    setTyped("");
  };

  const removed = [
    { icon: CalendarRange, label: `${monthsTracked} মাসের বাজেট আর আয়` },
    { icon: ReceiptText, label: `${entries}টা খরচের এন্ট্রি` },
    { icon: WalletMinimal, label: "সব অ্যাকাউন্ট আর ব্যালেন্স" },
    { icon: ArrowLeftRight, label: "সব ট্রান্সফার" },
  ];

  return (
    <Card className="px-[22px] pt-[22px] pb-6">
      <div className="flex items-start gap-3">
        <span className="bg-danger-bg text-danger flex h-10 w-10 flex-none items-center justify-center rounded-full">
          <Trash2 className="h-[18px] w-[18px]" />
        </span>
        <div>
          <h2 className="font-display text-[18px] font-bold">সব হিসাব মুছে ফেলা</h2>
          <p className="text-ink-muted mt-0.5 text-[14px] leading-[1.55]">
            নতুন করে শুরু করতে চাইলে। একবার মুছলে আর ফেরত আনা যাবে না।
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3.5 sm:grid-cols-2">
        <div className="bg-field rounded-[16px] px-[18px] py-4">
          <p className="text-ink-muted text-[14px] font-medium">যা মুছে যাবে</p>
          <ul className="mt-2.5 flex flex-col gap-2">
            {removed.map(({ icon: Icon, label }) => (
              <li key={label} className="text-ink-soft flex items-center gap-2.5 text-[15px]">
                <Icon className="text-danger h-4 w-4 flex-none" />
                {label}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-panel rounded-[16px] px-[18px] py-4">
          <p className="text-ink-soft text-[14px] font-medium">যা থাকবে</p>
          <ul className="mt-2.5 flex flex-col gap-2">
            {["তোমার নাম আর ইমেইল", "পাসওয়ার্ড আর লগইন"].map((label) => (
              <li key={label} className="text-ink-panel flex items-center gap-2.5 text-[15px]">
                <Check className="text-primary h-4 w-4 flex-none" />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {confirming ? (
        <form
          onSubmit={(event) => event.preventDefault()}
          className="bg-danger-bg border-danger-line animate-pop-in mt-5 rounded-[16px] border px-[18px] pt-4 pb-[18px]"
        >
          <p className="text-danger-ink flex items-center gap-2 text-[15px] font-semibold">
            <TriangleAlert className="h-4 w-4 flex-none" />
            সত্যিই সব মুছবে?
          </p>
          <label htmlFor={inputId} className="text-danger-ink mt-1.5 block text-[14px] leading-[1.55]">
            নিশ্চিত করতে নিচে <span className="font-bold">“{phrase}”</span> লেখো।
          </label>
          <input
            id={inputId}
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
            autoComplete="off"
            placeholder={phrase}
            className="bg-surface border-danger-field text-ink placeholder:text-ink-faint focus:border-danger rounded-field mt-3 min-h-[50px] w-full border-[1.5px] px-[15px] text-[16px] outline-none transition-colors"
          />
          <div className="mt-3.5 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={cancel}
              className="bg-surface border-line text-ink hover:border-line-strong focus-visible:outline-primary min-h-[48px] cursor-pointer rounded-[12px] border-[1.5px] px-5 text-[15px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              থাক, মুছব না
            </button>
            <button
              type="submit"
              disabled={!ready}
              className="bg-danger font-display focus-visible:outline-danger flex min-h-[48px] cursor-pointer items-center justify-center gap-2 rounded-[12px] px-5 text-[15px] font-bold text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Trash2 className="h-4 w-4" />
              সব মুছে ফেলো
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="border-danger-line text-danger hover:bg-danger-bg focus-visible:outline-danger mt-5 flex min-h-[50px] w-full cursor-pointer items-center justify-center gap-2 rounded-[12px] border-[1.5px] px-4 text-[16px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <Trash2 className="h-4 w-4" />
          সব হিসাব মুছে ফেলো
        </button>
      )}
    </Card>
  );
}
