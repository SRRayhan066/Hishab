import {
  FormCardSkeleton,
  ListCardSkeleton,
} from "@/components/app/ScreenSkeletons";
import { SkeletonScreen } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <SkeletonScreen>
      {/* Matches the screen's own grid: stacked on a phone, two columns from
          the large breakpoint up. */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start">
        <FormCardSkeleton />
        <div className="flex flex-col gap-4">
          <ListCardSkeleton rows={2} subheading={false} rowHeight="h-[52px]" />
          <ListCardSkeleton rows={3} subheading={false} rowHeight="h-[46px]" />
        </div>
      </div>
    </SkeletonScreen>
  );
}
