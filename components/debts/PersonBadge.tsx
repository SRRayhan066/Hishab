import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

const owedTone = "bg-panel text-primary-dark";
const owingTone = "bg-[#fbf0ea] text-[#8f4a33]";

export function PersonBadge({
  name,
  owing,
  className,
}: {
  name: string;
  owing: boolean;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "font-display flex flex-none items-center justify-center rounded-full font-bold",
        owing ? owingTone : owedTone,
        className,
      )}
    >
      {Array.from(name)[0]?.toLocaleUpperCase()}
    </span>
  );
}

export function DirectionIcon({
  out,
  className,
}: {
  out: boolean;
  className?: string;
}) {
  const Icon = out ? ArrowUpRight : ArrowDownLeft;

  return (
    <span
      aria-hidden
      className={cn(
        "flex flex-none items-center justify-center",
        out ? owingTone : owedTone,
        className,
      )}
    >
      <Icon className="h-[17px] w-[17px]" strokeWidth={2.4} />
    </span>
  );
}
