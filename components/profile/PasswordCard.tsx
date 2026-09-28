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

export function PasswordCard({ email }: { email: string }) {
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
    <Card className="px-[22px] pt-[22px] pb-6">
      <form
        onSubmit={handleSubmit(onSubmit)}
        onChange={() => setDone(false)}
        noValidate
      >
        <h2 className="font-display text-[18px] font-bold">{t("passwordTitle")}</h2>
        <p className="text-ink-muted mt-0.5 text-[14px] leading-[1.55]">
          {t("passwordHint")}
        </p>

        <input
          type="email"
          name="username"
          autoComplete="username"
          value={email}
          readOnly
          hidden
        />

        <div className="mt-4 flex flex-col gap-4">
          <PasswordInput
            label={t("currentPassword")}
            autoComplete="current-password"
            placeholder="••••••"
            error={errors.currentPassword?.message}
            {...register("currentPassword")}
          />
          <PasswordInput
            label={t("newPassword")}
            autoComplete="new-password"
            placeholder={t("newPasswordPlaceholder")}
            error={errors.password?.message}
            {...register("password")}
          />
          <PasswordInput
            label={t("confirmNewPassword")}
            autoComplete="new-password"
            placeholder={t("confirmPlaceholder")}
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />
          <FormError message={errors.root?.message} />
        </div>

        <button
          type="submit"
          disabled={!complete || isSubmitting}
          className="bg-ink font-display focus-visible:outline-primary mt-5 min-h-[50px] w-full cursor-pointer rounded-[12px] px-4 text-[16px] font-bold text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isSubmitting ? t("changing") : t("changePassword")}
        </button>

        {done && (
          <p aria-live="polite" className="text-primary-dark mt-3 text-center text-[14px] font-medium">
            {t("passwordChanged")}
          </p>
        )}
      </form>
    </Card>
  );
}
