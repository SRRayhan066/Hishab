import { z } from "zod";
import type { Translator } from "@/lib/i18n/translate";

export function profileSchemas(t: Translator<"validation">, clearPhrase: string) {
  const name = z.object({
    name: z
      .string()
      .trim()
      .min(1, t("nameRequired"))
      .max(60, t("nameTooLong")),
  });

  const clearData = z.object({
    phrase: z
      .string()
      .trim()
      .refine((value) => value === clearPhrase, {
        error: t("clearPhrase", { phrase: clearPhrase }),
      }),
  });

  return { name, clearData };
}

type ProfileSchemas = ReturnType<typeof profileSchemas>;

export type ProfileNameValues = z.infer<ProfileSchemas["name"]>;
export type ClearDataValues = z.input<ProfileSchemas["clearData"]>;
