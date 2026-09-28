"use client";

import { useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";
import { authSchemas, type SetPasswordValues } from "@/lib/validation/auth";
import { useT } from "@/lib/i18n/client";
import type { AuthActionResult } from "@/types/auth";

type SetPasswordFormProps = {
  email: string;
  cta: string;
  action: (values: SetPasswordValues) => Promise<AuthActionResult>;
};

export function SetPasswordForm({ email, cta, action }: SetPasswordFormProps) {
  const router = useRouter();
  const [navigating, startNavigation] = useTransition();
  const t = useT("auth");
  const errorsT = useT("errors");
  const validation = useT("validation");
  const schemas = useMemo(() => authSchemas(validation), [validation]);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SetPasswordValues>({
    resolver: zodResolver(schemas.setPassword),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async (values: SetPasswordValues) => {
    try {
      const result = await action(values);
      if (result.error) {
        setError("root", { message: result.error });
        return;
      }
      startNavigation(() => router.replace("/home"));
    } catch {
      setError("root", { message: errorsT("requestFailed") });
    }
  };

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-[14px]"
    >
      <input
        type="email"
        name="username"
        autoComplete="username"
        value={email}
        readOnly
        hidden
      />

      <PasswordInput
        label={t("password")}
        autoComplete="new-password"
        placeholder={t("passwordPlaceholder")}
        error={errors.password?.message}
        {...register("password")}
      />

      <PasswordInput
        label={t("confirmPassword")}
        autoComplete="new-password"
        placeholder={t("confirmPlaceholder")}
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />

      <FormError message={errors.root?.message} />

      <Button
        type="submit"
        loading={isSubmitting || navigating}
        className="mt-[6px]"
      >
        {cta}
      </Button>
    </form>
  );
}
