"use client";

import type { ChangeEvent, ComponentPropsWithRef } from "react";

type AmountInputProps = Omit<ComponentPropsWithRef<"input">, "type" | "inputMode">;

export function AmountInput({ onChange, ...props }: AmountInputProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const digits = event.target.value.replace(/\D/g, "");
    if (digits !== event.target.value) event.target.value = digits;
    onChange?.(event);
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      autoComplete="off"
      {...props}
      onChange={handleChange}
    />
  );
}
