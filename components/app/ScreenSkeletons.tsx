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
    <Card className="px-6 pt-[26px] pb-7">
      <SkeletonText className="w-[104px]" />
      <Skeleton className="mt-[9px] h-[clamp(46px,11vw,74px)] w-[68%] rounded-[12px]" />

      <div className="mt-3.5 flex flex-col gap-2">
        <SkeletonText className="w-full max-w-[34ch]" />
        <SkeletonText className="w-[62%] max-w-[22ch]" />
      </div>

      <div className="mt-6 grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(170px,1fr))]">
        {[0, 1].map((tile) => (
          <div key={tile} className="bg-field rounded-[16px] px-[18px] py-4">
            <SkeletonText className="bg-line-soft w-[72%]" />
            <Skeleton className="bg-line-soft mt-[7px] h-[19px] w-[56%] rounded-[5px]" />
          </div>
        ))}
      </div>

      {bar ? (
        <div className="mt-[26px]">
          <Skeleton className="h-[18px]" />
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
    <Card className="px-5 pt-6 pb-4">
      <div className="flex flex-wrap items-baseline justify-between gap-4 px-1 pb-1">
        <div className="flex flex-col gap-[7px]">
          <Skeleton className="h-[17px] w-[142px] rounded-[5px]" />
          <SkeletonText className="w-[190px]" />
        </div>
        <div className="flex gap-4">
          <SkeletonText className="w-[72px]" />
          <SkeletonText className="w-[72px]" />
        </div>
      </div>

      <div className="mt-3 pl-[54px]">
        <Skeleton className="h-[190px] rounded-[10px] sm:h-[240px] lg:h-[280px]" />
      </div>

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
    <Card className="px-[22px] pt-6 pb-[26px]">
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

/** A form card: label, field, label, field, then the submit button. */
export function FormCardSkeleton() {
  return (
    <Card className="px-[22px] pt-[22px] pb-6 sm:px-6 sm:pt-[26px] sm:pb-7">
      <SkeletonText className="w-[96px]" />
      <Skeleton className="mt-2 h-[clamp(34px,9vw,60px)] w-[72%] rounded-[10px]" />
      <Skeleton className="bg-line-soft mt-2.5 h-[2px] rounded-none" />

      <SkeletonText className="mt-5 w-[118px]" />
      <div className="mt-2.5 flex flex-wrap gap-2">
        {[92, 76, 110, 84].map((width, chip) => (
          <Skeleton key={chip} className="h-[38px]" style={{ width }} />
        ))}
      </div>

      <Skeleton className="mt-4 h-[46px] rounded-[13px]" />
      <Skeleton className="mt-6 h-[50px] rounded-[12px]" />
    </Card>
  );
}
