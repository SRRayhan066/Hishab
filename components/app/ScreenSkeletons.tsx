import { Card } from "@/components/ui/Card";
import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";

/**
 * The placeholder screens reuse `Card` rather than redrawing its border and
 * radius, so the frame on screen while the numbers load is the same frame
 * they land in. Only the text inside changes, which is why the swap reads as
 * filling in rather than as a jump.
 */

/** The headline card: one large figure, two tiles, a progress bar. */
export function BalanceCardSkeleton({ bar = true }: { bar?: boolean }) {
  return (
    <Card className="p-5 md:p-6">
      <SkeletonText className="w-[104px]" />
      <Skeleton className="mt-[9px] h-[52px] w-[68%] rounded-[12px] md:h-[67px]" />

      <div className="mt-3.5 flex flex-col gap-2">
        <SkeletonText className="w-full max-w-[34ch]" />
        <SkeletonText className="w-[62%] max-w-[22ch]" />
      </div>

      <div className="mt-[18px] grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(140px,1fr))]">
        {[0, 1].map((tile) => (
          <div key={tile} className="bg-field rounded-[16px] px-[18px] py-4">
            <SkeletonText className="bg-line-soft w-[72%]" />
            <Skeleton className="bg-line-soft mt-[7px] h-[19px] w-[56%] rounded-[5px]" />
          </div>
        ))}
      </div>

      {bar ? (
        <div className="mt-[18px]">
          <Skeleton className="h-3.5" />
          <div className="mt-2.5 flex justify-between gap-3">
            <SkeletonText className="w-[88px]" />
            <SkeletonText className="hidden w-[150px] sm:block" />
            <SkeletonText className="w-[88px]" />
          </div>
        </div>
      ) : null}
    </Card>
  );
}

/** The burndown card: heading, legend, and the chart itself. */
export function ChartCardSkeleton() {
  return (
    <Card className="p-5 md:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2.5">
        <Skeleton className="h-[17px] w-[142px] rounded-[5px]" />
        <div className="flex gap-3.5">
          <SkeletonText className="w-[48px]" />
          <SkeletonText className="w-[48px]" />
        </div>
      </div>

      <Skeleton className="mt-3.5 h-[170px] rounded-[10px] md:h-[220px]" />
      <div className="h-[30px]" />
    </Card>
  );
}

/**
 * The repeating "heading, then a list of lines" card behind the category
 * breakdown, the month history and the savings history.
 */
export function ListCardSkeleton({
  rows = 4,
  subheading = true,
  rowHeight = "h-[62px]",
}: {
  rows?: number;
  subheading?: boolean;
  rowHeight?: string;
}) {
  return (
    <Card className="p-5 md:p-6">
      <Skeleton className="h-[17px] w-[168px] rounded-[5px]" />
      {subheading ? <SkeletonText className="mt-[9px] w-[74%]" /> : null}

      <div className="mt-4 flex flex-col gap-2.5">
        {Array.from({ length: rows }, (_, row) => (
          <Skeleton key={row} className={`${rowHeight} rounded-[14px]`} />
        ))}
      </div>
    </Card>
  );
}
