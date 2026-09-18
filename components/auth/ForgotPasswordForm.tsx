"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";
import {
  forgotPasswordSchema,
  type ForgotPasswordValues,
} from "@/lib/validation/auth";
import { requestPasswordReset } from "@/app/actions/password-reset";
import { requestFailedError } from "@/lib/auth/messages";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [navigating, startNavigation] = useTransition();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
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
        label="ইমেইল"
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="tumi@example.com"
        error={errors.email?.message}
        {...register("email")}
      />

      <FormError message={errors.root?.message} />

      <Button
        type="submit"
        loading={isSubmitting || navigating}
        className="mt-[6px]"
      >
        কোড পাঠাও
      </Button>
    </form>
  );
}
