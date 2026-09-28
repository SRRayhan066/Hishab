import { z } from "zod";

const email = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "ইমেইলটা লিখে দাও।")
  .pipe(z.email({ error: "ইমেইলটা একবার দেখে নাও।" }));

const password = z
  .string()
  .min(1, "পাসওয়ার্ডটা লিখে দাও।")
  .min(6, "পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।");

const confirmPassword = z.string().min(1, "পাসওয়ার্ডটা আবার লেখো।");

const passwordsMustMatch = {
  error: "পাসওয়ার্ড দুটো মিলছে না।",
  path: ["confirmPassword"],
};

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
    confirmPassword,
  })
  .refine(
    (values) => values.password === values.confirmPassword,
    passwordsMustMatch,
  );

export const setPasswordSchema = z
  .object({
    password,
    confirmPassword,
  })
  .refine(
    (values) => values.password === values.confirmPassword,
    passwordsMustMatch,
  );

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "এখনকার পাসওয়ার্ডটা লিখে দাও।"),
    password,
    confirmPassword,
  })
  .refine(
    (values) => values.password === values.confirmPassword,
    passwordsMustMatch,
  )
  .refine((values) => values.password !== values.currentPassword, {
    error: "নতুন পাসওয়ার্ডটা আগেরটার থেকে আলাদা হতে হবে।",
    path: ["password"],
  });

export const forgotPasswordSchema = z.object({ email });

const banglaDigits = "০১২৩৪৫৬৭৮৯";

function toEnglishDigits(value: string) {
  return value.replace(/[০-৯]/g, (digit) =>
    String(banglaDigits.indexOf(digit)),
  );
}

export const resetCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "কোডটা লিখে দাও।")
    .transform(toEnglishDigits)
    .pipe(z.string().regex(/^\d{6}$/, "কোডটা ৬ অঙ্কের হবে।")),
});

export type SignInValues = z.infer<typeof signInSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ResetCodeValues = z.input<typeof resetCodeSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
export type SetPasswordValues = z.infer<typeof setPasswordSchema>;
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
