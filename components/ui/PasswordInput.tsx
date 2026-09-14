"use client";

import type { ComponentPropsWithRef } from "react";
import { useState } from "react";
import { Input } from "./Input";

type PasswordInputProps = Omit<
  ComponentPropsWithRef<"input">,
  "id" | "type"
> & {
  label: string;
  error?: string;
};

export function PasswordInput({ label, error, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <Input
      label={label}
      error={error}
      type={visible ? "text" : "password"}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-pressed={visible}
          aria-label={visible ? "পাসওয়ার্ড লুকাও" : "পাসওয়ার্ড দেখাও"}
          className="text-ink-soft hover:text-ink focus-visible:outline-primary flex-none cursor-pointer rounded-md px-[10px] py-1 text-[14px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          {visible ? "লুকাও" : "দেখাও"}
        </button>
      }
      {...props}
    />
  );
}
