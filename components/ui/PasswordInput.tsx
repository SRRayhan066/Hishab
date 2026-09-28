"use client";

import type { ComponentPropsWithRef } from "react";
import { useState } from "react";
import { useT } from "@/lib/i18n/client";
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
  const t = useT("common");

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
          aria-label={t(visible ? "hidePassword" : "showPassword")}
          className="text-ink-soft hover:text-ink focus-visible:outline-primary flex-none cursor-pointer rounded-md px-[10px] py-1 text-[14px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          {t(visible ? "hide" : "show")}
        </button>
      }
      {...props}
    />
  );
}
