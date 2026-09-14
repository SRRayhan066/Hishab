"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { FormError } from "./FormError";
import { signInSchema, type SignInValues } from "@/lib/validation/auth";
import { fakeRequest } from "@/lib/utils";

export function SignInForm({ cta }: { cta: string }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "", remember: true },
  });

  const onSubmit = async (values: SignInValues) => {
    await fakeRequest();
    console.log("sign in", values);
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
        <a
          href="#reset"
          className="text-primary hover:text-primary-dark focus-visible:outline-primary rounded-sm text-[15px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          পাসওয়ার্ড ভুলে গেছি
        </a>
      </div>

      <FormError message={errors.root?.message} />

      <Button type="submit" loading={isSubmitting} className="mt-[6px]">
        {cta}
      </Button>
    </form>
  );
}
