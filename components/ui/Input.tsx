import type { ComponentPropsWithRef, ReactNode } from "react";
import { useId } from "react";
import { cn } from "@/lib/utils";

type InputProps = Omit<ComponentPropsWithRef<"input">, "id"> & {
  label: string;
  error?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
};

export function Input({
  label,
  error,
  leading,
  trailing,
  className,
  ...props
}: InputProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col gap-[7px]">
      <label htmlFor={id} className="text-ink-soft text-[14px] font-semibold">
        {label}
      </label>

      <div
        className={cn(
          "bg-field rounded-field flex min-h-[50px] items-center gap-2 border-[1.5px] px-[15px] transition-colors",
          "focus-within:border-primary focus-within:bg-surface",
          error ? "border-danger-field" : "border-line",
        )}
      >
        {leading}
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "text-ink placeholder:text-ink-faint min-w-0 flex-1 border-none bg-transparent py-[14px] text-[16px] outline-none",
            className,
          )}
          {...props}
        />
        {trailing}
      </div>

      {error && (
        <p id={errorId} className="text-danger text-[13px] font-medium">
          {error}
        </p>
      )}
    </div>
  );
}
