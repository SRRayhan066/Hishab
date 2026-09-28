"use client";

import { useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";
import { authSchemas, type SignUpValues } from "@/lib/validation/auth";
import { signUp } from "@/app/actions/auth";
import { useT } from "@/lib/i18n/client";

export function SignUpForm({ cta }: { cta: string }) {
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
  } = useForm<SignUpValues>({
    resolver: zodResolver(schemas.signUp),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async (values: SignUpValues) => {
    try {
      const result = await signUp(values);
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
      <Input
        label={t("name")}
        autoComplete="name"
        placeholder={t("namePlaceholder")}
        error={errors.name?.message}
        {...register("name")}
      />

      <Input
        label={t("email")}
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder={t("emailPlaceholder")}
        error={errors.email?.message}
        {...register("email")}
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
