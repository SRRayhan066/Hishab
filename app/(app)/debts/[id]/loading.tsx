import { ListCardSkeleton } from "@/components/app/ScreenSkeletons";
import { Card } from "@/components/ui/Card";
import { Skeleton, SkeletonScreen, SkeletonText } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <SkeletonScreen>
      <Skeleton className="-mt-2 h-9 w-[160px] rounded-[10px]" />
      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <Card className="grid gap-[18px] p-5 md:p-6">
          <div className="flex items-center gap-3">
            <Skeleton className="h-[52px] w-[52px] flex-none" />
            <Skeleton className="h-[50px] w-[60%] rounded-[10px]" />
          </div>
          <Skeleton className="h-3" />
          <SkeletonText className="w-[50%]" />
          <div className="grid grid-cols-2 gap-2.5">
            <Skeleton className="h-[52px] rounded-[14px]" />
            <Skeleton className="h-[52px] rounded-[14px]" />
          </div>
        </Card>
        <ListCardSkeleton rows={3} subheading={false} rowHeight="h-[62px]" />
      </div>
    </SkeletonScreen>
  );
}
