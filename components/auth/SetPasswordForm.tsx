"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";
import {
  setPasswordSchema,
  type SetPasswordValues,
} from "@/lib/validation/auth";
import { completeGoogleSignUp } from "@/app/actions/auth";
import { requestFailedError } from "@/lib/auth/messages";

export function SetPasswordForm({ email }: { email: string }) {
  const router = useRouter();
  const [navigating, startNavigation] = useTransition();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SetPasswordValues>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async (values: SetPasswordValues) => {
    try {
      const result = await completeGoogleSignUp(values);
      if (result.error) {
        setError("root", { message: result.error });
        return;
      }
      startNavigation(() => router.replace("/home"));
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
      <input
        type="email"
        name="username"
        autoComplete="username"
        value={email}
        readOnly
        hidden
      />

      <PasswordInput
        label="পাসওয়ার্ড"
        autoComplete="new-password"
        placeholder="অন্তত ৬ অক্ষর"
        error={errors.password?.message}
        {...register("password")}
      />

      <PasswordInput
        label="পাসওয়ার্ড আবার লেখো"
        autoComplete="new-password"
        placeholder="আগেরটার মতোই"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />

      <FormError message={errors.root?.message} />

      <Button
        type="submit"
        loading={isSubmitting || navigating}
        className="mt-[6px]"
      >
        সাইন ইন
      </Button>
    </form>
  );
}
