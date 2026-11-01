import {
  BalanceCardSkeleton,
  ListCardSkeleton,
} from "@/components/app/ScreenSkeletons";
import { Skeleton, SkeletonScreen } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <SkeletonScreen>
      <BalanceCardSkeleton bar={false} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((card) => (
          <Skeleton key={card} className="h-[172px] rounded-[18px]" />
        ))}
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 md:grid-cols-2">
        <ListCardSkeleton rows={3} subheading={false} rowHeight="h-[58px]" />
        <ListCardSkeleton rows={3} subheading={false} rowHeight="h-[36px]" />
      </div>
    </SkeletonScreen>
  );
}
