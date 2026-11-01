import {
  BalanceCardSkeleton,
  ChartCardSkeleton,
  ListCardSkeleton,
} from "@/components/app/ScreenSkeletons";
import { SkeletonScreen } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <SkeletonScreen>
      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <div className="grid min-w-0 gap-4">
          <BalanceCardSkeleton />
          <ChartCardSkeleton />
        </div>
        <div className="grid min-w-0 gap-4">
          <ListCardSkeleton rows={4} subheading={false} />
          <ListCardSkeleton rows={3} subheading={false} rowHeight="h-[46px]" />
        </div>
      </div>
    </SkeletonScreen>
  );
}
