import { Card } from "@/components/ui/Card";

export function ComingSoon({ title }: { title: string }) {
  return (
    <Card className="px-6 py-12 text-center">
      <p className="font-display text-[19px] font-bold">{title}</p>
      <p className="text-ink-muted mt-2 text-[15px]">
        এই স্ক্রিনটা এখনো বানানো হয়নি।
      </p>
    </Card>
  );
}
