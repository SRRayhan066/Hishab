import { ListCardSkeleton } from "@/components/app/ScreenSkeletons";
import { Card } from "@/components/ui/Card";
import { Skeleton, SkeletonScreen, SkeletonText } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <SkeletonScreen>
      {/* The plan summary: what comes in, what is spoken for, what is left. */}
      <Card className="px-[22px] pt-6 pb-[26px]">
        <Skeleton className="h-[17px] w-[160px] rounded-[5px]" />
        <div className="mt-4 grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
          {[0, 1, 2].map((tile) => (
            <div key={tile} className="bg-field rounded-[16px] px-[18px] py-4">
              <SkeletonText className="bg-line-soft w-[68%]" />
              <Skeleton className="bg-line-soft mt-[7px] h-[19px] w-[54%] rounded-[5px]" />
            </div>
          ))}
        </div>
      </Card>

      {/* Income, then the spending categories — both editable row lists. */}
      <ListCardSkeleton rows={3} rowHeight="h-[52px]" />
      <ListCardSkeleton rows={5} rowHeight="h-[52px]" />
    </SkeletonScreen>
  );
}
