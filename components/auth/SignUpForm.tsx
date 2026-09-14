"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { FormError } from "./FormError";
import { signUpSchema, type SignUpValues } from "@/lib/validation/auth";
import { fakeRequest } from "@/lib/utils";

export function SignUpForm({ cta }: { cta: string }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async (values: SignUpValues) => {
    await fakeRequest();
    console.log("sign up", {
      name: values.name,
      email: values.email,
      password: values.password,
    });
  };

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-[14px]"
    >
      <Input
        label="তোমার নাম"
        autoComplete="name"
        placeholder="যেমন, রাকিব"
        error={errors.name?.message}
        {...register("name")}
      />

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

      <Button type="submit" loading={isSubmitting} className="mt-[6px]">
        {cta}
      </Button>
    </form>
  );
}
