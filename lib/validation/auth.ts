import { z } from "zod";
import { toLatinDigits } from "@/lib/i18n/format";
import type { Translator } from "@/lib/i18n/translate";

export function authSchemas(t: Translator<"validation">) {
  const email = z
    .string()
    .trim()
    .toLowerCase()
    .min(1, t("emailRequired"))
    .pipe(z.email({ error: t("emailInvalid") }));

  const password = z
    .string()
    .min(1, t("passwordRequired"))
    .min(6, t("passwordShort"));

  const confirmPassword = z.string().min(1, t("confirmRequired"));

  const passwordsMustMatch = {
    error: t("passwordsMismatch"),
    path: ["confirmPassword"],
  };

  const signIn = z.object({
    email,
    password,
    remember: z.boolean(),
  });

  const signUp = z
    .object({
      name: z.string().trim().min(1, t("nameRequired")),
      email,
      password,
      confirmPassword,
    })
    .refine(
      (values) => values.password === values.confirmPassword,
      passwordsMustMatch,
    );

  const setPassword = z
    .object({
      password,
      confirmPassword,
    })
    .refine(
      (values) => values.password === values.confirmPassword,
      passwordsMustMatch,
    );

  const changePassword = z
    .object({
      currentPassword: z.string().min(1, t("currentPasswordRequired")),
      password,
      confirmPassword,
    })
    .refine(
      (values) => values.password === values.confirmPassword,
      passwordsMustMatch,
    )
    .refine((values) => values.password !== values.currentPassword, {
      error: t("passwordUnchanged"),
      path: ["password"],
    });

  const forgotPassword = z.object({ email });

  const resetCode = z.object({
    code: z
      .string()
      .trim()
      .min(1, t("codeRequired"))
      .transform(toLatinDigits)
      .pipe(z.string().regex(/^\d{6}$/, t("codeLength"))),
  });

  return {
    signIn,
    signUp,
    setPassword,
    changePassword,
    forgotPassword,
    resetCode,
  };
}

type AuthSchemas = ReturnType<typeof authSchemas>;

export type SignInValues = z.infer<AuthSchemas["signIn"]>;
export type ForgotPasswordValues = z.infer<AuthSchemas["forgotPassword"]>;
export type ResetCodeValues = z.input<AuthSchemas["resetCode"]>;
export type SignUpValues = z.infer<AuthSchemas["signUp"]>;
export type SetPasswordValues = z.infer<AuthSchemas["setPassword"]>;
export type ChangePasswordValues = z.infer<AuthSchemas["changePassword"]>;
