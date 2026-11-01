import { ListCardSkeleton } from "@/components/app/ScreenSkeletons";
import { Card } from "@/components/ui/Card";
import { Skeleton, SkeletonScreen } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <SkeletonScreen>
      <Card className="grid gap-4 p-5 md:p-6">
        <Skeleton className="h-[22px]" />
        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2].map((stat) => (
            <Skeleton key={stat} className="h-11 rounded-[8px]" />
          ))}
        </div>
        <Skeleton className="h-[46px] rounded-[13px]" />
      </Card>
      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <ListCardSkeleton rows={5} subheading={false} rowHeight="h-[88px]" />
        <ListCardSkeleton rows={2} subheading={false} rowHeight="h-[72px]" />
      </div>
    </SkeletonScreen>
  );
}
