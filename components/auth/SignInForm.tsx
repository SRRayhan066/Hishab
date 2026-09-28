"use client";

import { useMemo, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";
import { authSchemas, type SignInValues } from "@/lib/validation/auth";
import { signIn } from "@/app/actions/auth";
import { useT } from "@/lib/i18n/client";

export function SignInForm({ cta }: { cta: string }) {
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
    resetField,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(schemas.signIn),
    defaultValues: { email: "", password: "", remember: true },
  });

  const onSubmit = async (values: SignInValues) => {
    try {
      const result = await signIn(values);
      if (result.error) {
        resetField("password");
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
        autoComplete="current-password"
        placeholder={t("passwordPlaceholder")}
        error={errors.password?.message}
        {...register("password")}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Checkbox label={t("remember")} {...register("remember")} />
        <Link
          href="/forgot-password"
          className="text-primary hover:text-primary-dark focus-visible:outline-primary rounded-sm text-[15px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          {t("forgotLink")}
        </Link>
      </div>

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
