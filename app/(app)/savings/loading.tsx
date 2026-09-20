import { Card } from "@/components/ui/Card";
import {
  BalanceCardSkeleton,
  ListCardSkeleton,
} from "@/components/app/ScreenSkeletons";
import { Skeleton, SkeletonScreen, SkeletonText } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <SkeletonScreen>
      <BalanceCardSkeleton bar={false} />

      {/* The opening-savings card: one label, one field, one button. */}
      <Card className="px-[22px] pt-6 pb-[26px]">
        <Skeleton className="h-[17px] w-[150px] rounded-[5px]" />
        <SkeletonText className="mt-[9px] w-[80%]" />
        <Skeleton className="mt-4 h-[46px] rounded-[13px]" />
      </Card>

      <ListCardSkeleton rows={4} rowHeight="h-[58px]" />
    </SkeletonScreen>
  );
}
