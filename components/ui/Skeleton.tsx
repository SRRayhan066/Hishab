import type { ComponentPropsWithRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * A placeholder with the same footprint as the thing it stands in for, so
 * content arriving never pushes the page around under the reader's thumb.
 *
 * `animate-pulse` is a plain opacity fade rather than a moving gradient —
 * cheap enough that a low-end phone can run it while the page is still
 * hydrating.
 */
export function Skeleton({
  className,
  ...props
}: ComponentPropsWithRef<"div">) {
  return (
    <div
      aria-hidden
      className={cn(
        "bg-field-alt animate-pulse rounded-full motion-reduce:animate-none",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Wraps a screen's placeholders. It paints on the first frame of a
 * navigation — no fade, no delay — so the shape of the screen is on the page
 * before the numbers are, on a tab switch and on a reload alike.
 */
export function SkeletonScreen({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <p role="status" className="sr-only">
        লোড হচ্ছে
      </p>
      {children}
    </div>
  );
}

/** A line of text that has not arrived yet. */
export function SkeletonText({
  className,
  ...props
}: ComponentPropsWithRef<"div">) {
  return <Skeleton className={cn("h-[13px] rounded-[4px]", className)} {...props} />;
}
