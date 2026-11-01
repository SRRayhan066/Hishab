import { ListCardSkeleton } from "@/components/app/ScreenSkeletons";
import { SkeletonScreen } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <SkeletonScreen>
      <ListCardSkeleton rows={7} rowHeight="h-[58px]" />
    </SkeletonScreen>
  );
}
