import { Card } from "@/components/ui/Card";
import { getT } from "@/lib/i18n/server";

export async function ComingSoon({ title }: { title: string }) {
  const t = await getT("common");

  return (
    <Card className="px-6 py-12 text-center">
      <p className="font-display text-[19px] font-bold">{title}</p>
      <p className="text-ink-muted mt-2 text-[15px]">
        {t("comingSoon")}
      </p>
    </Card>
  );
}
