import type { ComponentPropsWithRef, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "outline" | "dark";

type ButtonProps = ComponentPropsWithRef<"button"> & {
  variant?: ButtonVariant;
  loading?: boolean;
  children: ReactNode;
};

const base =
  "inline-flex items-center justify-center gap-[10px] rounded-button font-semibold cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white min-h-[54px] px-4 py-4 text-[17px] font-bold font-display hover:bg-primary-dark",
  outline:
    "bg-surface text-ink border-[1.5px] border-line min-h-[52px] px-4 py-[14px] text-[16px] hover:border-line-strong hover:bg-field",
  dark: "bg-ink text-white min-h-[54px] px-4 py-4 text-[17px] font-bold font-display rounded-[16px] hover:bg-[#45413a]",
};

export function Button({
  variant = "primary",
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(base, variants[variant], className)}
      {...props}
    >
      {loading && <Loader2 className="h-[18px] w-[18px] animate-spin" />}
      {children}
    </button>
  );
}
