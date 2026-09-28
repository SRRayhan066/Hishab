import {
  BalanceCardSkeleton,
  FormCardSkeleton,
  ListCardSkeleton,
} from "@/components/app/ScreenSkeletons";
import { Card } from "@/components/ui/Card";
import { Skeleton, SkeletonScreen, SkeletonText } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <SkeletonScreen>
      <BalanceCardSkeleton bar={false} />

      <Card className="px-[22px] pt-6 pb-[26px]">
        <Skeleton className="h-[17px] w-[140px] rounded-[5px]" />
        <SkeletonText className="mt-[9px] w-[74%]" />
        <div className="mt-4 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((card) => (
            <Skeleton key={card} className="h-[172px] rounded-[20px]" />
          ))}
        </div>
        <Skeleton className="mt-4 h-[46px] rounded-[12px]" />
      </Card>

      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        <FormCardSkeleton />
        <ListCardSkeleton rows={3} subheading={false} rowHeight="h-[58px]" />
      </div>
      <ListCardSkeleton rows={4} rowHeight="h-[58px]" />
    </SkeletonScreen>
  );
}
