import {
  BalanceCardSkeleton,
  ChartCardSkeleton,
  ListCardSkeleton,
} from "@/components/app/ScreenSkeletons";
import { SkeletonScreen } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <SkeletonScreen>
      <BalanceCardSkeleton />
      <ChartCardSkeleton />
      <ListCardSkeleton rows={4} />
    </SkeletonScreen>
  );
}
