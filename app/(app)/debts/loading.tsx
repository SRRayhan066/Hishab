import { ListCardSkeleton } from "@/components/app/ScreenSkeletons";
import { Card } from "@/components/ui/Card";
import { Skeleton, SkeletonScreen, SkeletonText } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <SkeletonScreen>
      <Card className="grid gap-3.5 p-5 md:p-6">
        <div className="grid grid-cols-2 gap-3">
          {[0, 1].map((tile) => (
            <Skeleton key={tile} className="h-[118px] rounded-[16px]" />
          ))}
        </div>
        <SkeletonText className="w-[80%]" />
      </Card>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-2">
        <ListCardSkeleton rows={3} subheading={false} rowHeight="h-[66px]" />
        <ListCardSkeleton rows={2} subheading={false} rowHeight="h-[66px]" />
      </div>
    </SkeletonScreen>
  );
}
