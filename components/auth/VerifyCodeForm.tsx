"use client";

import { useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";
import { authSchemas } from "@/lib/validation/auth";
import { verifyPasswordResetCode } from "@/app/actions/password-reset";
import { useT } from "@/lib/i18n/client";

type CodeSchema = ReturnType<typeof authSchemas>["resetCode"];
type CodeInput = z.input<CodeSchema>;
type CodeOutput = z.output<CodeSchema>;

export function VerifyCodeForm() {
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
  } = useForm<CodeInput, unknown, CodeOutput>({
    resolver: zodResolver(schemas.resetCode),
    defaultValues: { code: "" },
  });

  const onSubmit = async (values: CodeOutput) => {
    try {
      const result = await verifyPasswordResetCode(values);
      if (result.error) {
        resetField("code");
        setError("root", { message: result.error });
        return;
      }
      startNavigation(() =>
        router.replace("/forgot-password/new-password"),
      );
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
        label={t("codeLabel")}
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        placeholder="••••••"
        className="font-display text-center text-[22px] tracking-[0.4em]"
        error={errors.code?.message}
        {...register("code")}
      />

      <FormError message={errors.root?.message} />

      <Button
        type="submit"
        loading={isSubmitting || navigating}
        className="mt-[6px]"
      >
        {t("verifyCode")}
      </Button>
    </form>
  );
}
