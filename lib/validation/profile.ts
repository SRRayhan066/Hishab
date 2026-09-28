import { z } from "zod";

export const clearDataPhrase = "মুছে ফেলো";

export const profileNameSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "নামটা লিখে দাও।")
    .max(60, "নামটা একটু ছোট করো।"),
});

export const clearDataSchema = z.object({
  phrase: z
    .string()
    .trim()
    .refine((value) => value === clearDataPhrase, {
      error: `নিশ্চিত করতে “${clearDataPhrase}” লেখো।`,
    }),
});

export type ProfileNameValues = z.infer<typeof profileNameSchema>;
export type ClearDataValues = z.input<typeof clearDataSchema>;
