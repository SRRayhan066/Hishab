import { GoogleIcon } from "@/components/icons/GoogleIcon";
import { cancelGoogleSignUp, completeGoogleSignUp } from "@/app/actions/auth";
import { getT } from "@/lib/i18n/server";
import { AuthStepLayout, authTextLinkClass } from "./AuthStepLayout";
import { SetPasswordForm } from "./SetPasswordForm";

type CompleteSignUpScreenProps = {
  name: string;
  email: string;
};

export async function CompleteSignUpScreen({
  name,
  email,
}: CompleteSignUpScreenProps) {
  const t = await getT("auth");

  return (
    <AuthStepLayout title={t("completeTitle")} subtitle={t("completeSubtitle")}>
      <div className="bg-field border-line rounded-field flex items-center gap-3 border-[1.5px] px-[15px] py-[13px]">
        <GoogleIcon className="h-5 w-5 flex-none" />
        <div className="min-w-0">
          <p className="truncate text-[16px] font-semibold">{name}</p>
          <p className="text-ink-muted truncate text-[14px]">{email}</p>
        </div>
      </div>

      <SetPasswordForm
        email={email}
        cta={t("signIn")}
        action={completeGoogleSignUp}
      />

      <form action={cancelGoogleSignUp} className="flex justify-center">
        <button type="submit" className={authTextLinkClass}>
          {t("cancel")}
        </button>
      </form>
    </AuthStepLayout>
  );
}
