"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";
import { signInSchema, type SignInValues } from "@/lib/validation/auth";
import { signIn } from "@/app/actions/auth";
import { requestFailedError } from "@/lib/auth/messages";

export function SignInForm({ cta }: { cta: string }) {
  const router = useRouter();
  const [navigating, startNavigation] = useTransition();
  const {
    register,
    handleSubmit,
    setError,
    resetField,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
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

      <PasswordInput
        label="পাসওয়ার্ড"
        autoComplete="current-password"
        placeholder="অন্তত ৬ অক্ষর"
        error={errors.password?.message}
        {...register("password")}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Checkbox label="মনে রাখো" {...register("remember")} />
        <Link
          href="/forgot-password"
          className="text-primary hover:text-primary-dark focus-visible:outline-primary rounded-sm text-[15px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          পাসওয়ার্ড ভুলে গেছি
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
