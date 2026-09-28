import { SignOutButton } from "@/components/app/SignOutButton";
import { Card } from "@/components/ui/Card";

export function SignOutCard() {
  return (
    <Card className="flex flex-col gap-4 px-[22px] pt-[22px] pb-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="font-display text-[18px] font-bold">সাইন আউট</h2>
        <p className="text-ink-muted mt-0.5 text-[14px] leading-[1.55]">
          এই ডিভাইস থেকে বের হয়ে যাবে। তোমার হিসাব যেমন আছে তেমনই থাকবে।
        </p>
      </div>
      <SignOutButton />
    </Card>
  );
}
