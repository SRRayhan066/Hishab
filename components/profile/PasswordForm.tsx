"use client";

import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePassword } from "@/app/actions/profile";
import { Card } from "@/components/ui/Card";
import { FormError } from "@/components/ui/FormError";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { useT } from "@/lib/i18n/client";
import { authSchemas, type ChangePasswordValues } from "@/lib/validation/auth";

const empty: ChangePasswordValues = {
  currentPassword: "",
  password: "",
  confirmPassword: "",
};

export function PasswordForm({ email }: { email: string }) {
  const t = useT("profile");
  const errorsT = useT("errors");
  const validation = useT("validation");
  const schemas = useMemo(() => authSchemas(validation), [validation]);
  const [done, setDone] = useState(false);
  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(schemas.changePassword),
    defaultValues: empty,
  });
  const filled = useWatch({ control });
  const complete = Boolean(
    filled.currentPassword && filled.password && filled.confirmPassword,
  );

  const onSubmit = async (values: ChangePasswordValues) => {
    setDone(false);
    try {
      const result = await changePassword(values);
      if (result.error) {
        setError("root", { message: result.error });
        return;
      }
      reset(empty);
      setDone(true);
    } catch {
      setError("root", { message: errorsT("requestFailed") });
    }
  };

  return (
    <Card className="w-full max-w-[560px] p-5 md:p-6">
      <form
        onSubmit={handleSubmit(onSubmit)}
        onChange={() => setDone(false)}
        noValidate
        className="grid gap-4"
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
          label={t("currentPassword")}
          autoComplete="current-password"
          error={errors.currentPassword?.message}
          {...register("currentPassword")}
        />
        <PasswordInput
          label={t("newPassword")}
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <PasswordInput
          label={t("confirmNewPassword")}
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />
        <span className="text-ink-soft text-[13px]">{t("passwordHint")}</span>
        <FormError message={errors.root?.message} />

        <button
          type="submit"
          disabled={!complete || isSubmitting}
          className="bg-ink font-display focus-visible:outline-primary h-[50px] cursor-pointer rounded-[14px] text-[16px] font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-45"
        >
          {isSubmitting ? t("changing") : t("changePassword")}
        </button>

        {done && (
          <p aria-live="polite" className="text-primary-dark text-center text-[14px] font-medium">
            {t("passwordChanged")}
          </p>
        )}
      </form>
    </Card>
  );
}
