"use client";

import { useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";
import { authSchemas, type ForgotPasswordValues } from "@/lib/validation/auth";
import { requestPasswordReset } from "@/app/actions/password-reset";
import { useT } from "@/lib/i18n/client";

export function ForgotPasswordForm() {
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
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(schemas.forgotPassword),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: ForgotPasswordValues) => {
    try {
      const result = await requestPasswordReset(values);
      if (result.error) {
        setError("root", { message: result.error });
        return;
      }
      startNavigation(() => router.push("/forgot-password/verify"));
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
      <Input
        label={t("email")}
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder={t("emailPlaceholder")}
        error={errors.email?.message}
        {...register("email")}
      />

      <FormError message={errors.root?.message} />

      <Button
        type="submit"
        loading={isSubmitting || navigating}
        className="mt-[6px]"
      >
        {t("sendCode")}
      </Button>
    </form>
  );
}
