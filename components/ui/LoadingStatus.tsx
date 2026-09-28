"use client";

import { useT } from "@/lib/i18n/client";

export function LoadingStatus() {
  const t = useT("common");

  return (
    <p role="status" className="sr-only">
      {t("loading")}
    </p>
  );
}
