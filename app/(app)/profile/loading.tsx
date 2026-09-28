import { FormCardSkeleton, ListCardSkeleton } from "@/components/app/ScreenSkeletons";
import { Card } from "@/components/ui/Card";
import { Skeleton, SkeletonScreen, SkeletonText } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <SkeletonScreen>
      <Card className="px-6 pt-[26px] pb-7">
        <div className="flex items-center gap-4">
          <Skeleton className="h-[68px] w-[68px] flex-none" />
          <div className="flex flex-1 flex-col gap-2.5">
            <Skeleton className="h-[26px] w-[52%] rounded-[8px]" />
            <SkeletonText className="w-[40%]" />
          </div>
        </div>
        <div className="mt-6 grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(160px,1fr))]">
          {[0, 1].map((tile) => (
            <div key={tile} className="bg-field rounded-[16px] px-[18px] py-4">
              <SkeletonText className="bg-line-soft w-[60%]" />
              <Skeleton className="bg-line-soft mt-[7px] h-[19px] w-[72%] rounded-[5px]" />
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        <FormCardSkeleton />
        <FormCardSkeleton />
      </div>
      <ListCardSkeleton rows={2} rowHeight="h-[150px]" />
    </SkeletonScreen>
  );
}
