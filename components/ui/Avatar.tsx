import { Blobatar } from "@blobatar/react";
import "blobatar/motion.css";
import { cn } from "@/lib/utils";

export function Avatar({
  seed,
  animate = "hover",
  className,
}: {
  seed: string;
  animate?: "hover" | "always";
  className?: string;
}) {
  return (
    <Blobatar
      name={seed}
      animate={animate}
      aria-hidden
      className={cn("block flex-none select-none", className)}
    />
  );
}
