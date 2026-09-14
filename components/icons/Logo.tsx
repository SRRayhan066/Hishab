import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-[11px]", className)}>
      <span className="bg-primary font-display flex h-[34px] w-[34px] flex-none items-center justify-center rounded-[11px] text-[19px] font-bold text-white">
        ৳
      </span>
      <span className="font-display text-[19px] font-bold">টাকার হিসাব</span>
    </div>
  );
}
