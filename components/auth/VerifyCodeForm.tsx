"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";
import { resetCodeSchema } from "@/lib/validation/auth";
import { verifyPasswordResetCode } from "@/app/actions/password-reset";
import { requestFailedError } from "@/lib/auth/messages";

type CodeInput = z.input<typeof resetCodeSchema>;
type CodeOutput = z.output<typeof resetCodeSchema>;

export function VerifyCodeForm() {
  const router = useRouter();
  const [navigating, startNavigation] = useTransition();
  const {
    register,
    handleSubmit,
    setError,
    resetField,
    formState: { errors, isSubmitting },
  } = useForm<CodeInput, unknown, CodeOutput>({
    resolver: zodResolver(resetCodeSchema),
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
      setError("root", { message: requestFailedError });
    }
  };

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-[14px]"
    >
      <Input
        label="৬ অঙ্কের কোড"
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
        কোড মিলাও
      </Button>
    </form>
  );
}
