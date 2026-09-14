import type { ComponentPropsWithRef } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: ComponentPropsWithRef<"section">) {
  return (
    <section
      className={cn(
        "bg-surface border-line-soft rounded-[22px] border shadow-[0_2px_4px_rgba(42,40,37,0.03)]",
        className,
      )}
      {...props}
    />
  );
}
