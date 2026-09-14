import { z } from "zod";

const email = z
  .string()
  .trim()
  .min(1, "ইমেইলটা লিখে দাও।")
  .pipe(z.email({ error: "ইমেইলটা একবার দেখে নাও।" }));

const password = z
  .string()
  .min(1, "পাসওয়ার্ডটা লিখে দাও।")
  .min(6, "পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।");

export const signInSchema = z.object({
  email,
  password,
  remember: z.boolean(),
});

export const signUpSchema = z
  .object({
    name: z.string().trim().min(1, "নামটা লিখে দাও।"),
    email,
    password,
    confirmPassword: z.string().min(1, "পাসওয়ার্ডটা আবার লেখো।"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    error: "পাসওয়ার্ড দুটো মিলছে না।",
    path: ["confirmPassword"],
  });

export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
