"use client";

import { useMemo, useState, useTransition } from "react";
import { Lock } from "lucide-react";
import { updateName } from "@/app/actions/profile";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useT } from "@/lib/i18n/client";
import { profileSchemas } from "@/lib/validation/profile";

export function NameForm({ name, email }: { name: string; email: string }) {
  const t = useT("profile");
  const common = useT("common");
  const errorsT = useT("errors");
  const validation = useT("validation");
  const schema = useMemo(
    () => profileSchemas(validation, t("clearPhrase")).name,
    [validation, t],
  );
  const [value, setValue] = useState(name);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, startTransition] = useTransition();
  const changed = value.trim() !== name;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const parsed = schema.safeParse({ name: value });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "");
      return;
    }

    setError("");
    setDone(false);
    startTransition(async () => {
      try {
        const result = await updateName(parsed.data);
        if (result.error) {
          setError(result.error);
          return;
        }
        setValue(parsed.data.name);
        setDone(true);
      } catch {
        setError(errorsT("requestFailed"));
      }
    });
  };

  return (
    <Card className="w-full max-w-[560px] p-5 md:p-6">
      <form onSubmit={handleSubmit} noValidate className="grid gap-4">
        <Input
          label={t("name")}
          value={value}
          error={error}
          maxLength={60}
          autoComplete="name"
          onChange={(event) => {
            setValue(event.target.value);
            setError("");
            setDone(false);
          }}
        />

        <div className="grid gap-1.5">
          <span className="text-ink-soft text-[14px] font-semibold">{t("email")}</span>
          <div className="bg-field-alt text-ink-soft rounded-field flex h-[50px] items-center gap-2.5 px-3.5 text-[16px]">
            <Lock className="h-[18px] w-[18px] flex-none" />
            <span className="min-w-0 flex-1 truncate">{email}</span>
          </div>
          <span className="text-ink-soft text-[13px]">{t("emailLocked")}</span>
        </div>

        <button
          type="submit"
          disabled={!changed || busy}
          className="bg-ink font-display focus-visible:outline-primary h-[50px] cursor-pointer rounded-[14px] text-[16px] font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-45"
        >
          {busy ? common("saving") : t("saveName")}
        </button>

        {done && (
          <p aria-live="polite" className="text-primary-dark text-center text-[14px] font-medium">
            {t("nameSaved")}
          </p>
        )}
      </form>
    </Card>
  );
}
