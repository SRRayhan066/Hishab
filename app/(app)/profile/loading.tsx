import { Card } from "@/components/ui/Card";
import { Skeleton, SkeletonScreen, SkeletonText } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <SkeletonScreen>
      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 md:grid-cols-2">
        <Card className="flex items-center gap-4 p-5 md:p-6">
          <Skeleton className="h-[68px] w-[68px] flex-none" />
          <div className="flex flex-1 flex-col gap-2.5">
            <Skeleton className="h-6 w-[60%] rounded-[8px]" />
            <SkeletonText className="w-[70%]" />
            <SkeletonText className="w-[80%]" />
          </div>
        </Card>
        <div className="grid gap-4">
          {[112, 168, 112].map((height, group) => (
            <Skeleton
              key={group}
              className="rounded-[20px]"
              style={{ height }}
            />
          ))}
        </div>
      </div>
    </SkeletonScreen>
  );
}
