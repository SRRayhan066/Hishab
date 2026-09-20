import { ListCardSkeleton } from "@/components/app/ScreenSkeletons";
import { SkeletonScreen } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <SkeletonScreen>
      <ListCardSkeleton rows={5} rowHeight="h-[58px]" />
      <ListCardSkeleton rows={4} subheading={false} rowHeight="h-[46px]" />
    </SkeletonScreen>
  );
}
