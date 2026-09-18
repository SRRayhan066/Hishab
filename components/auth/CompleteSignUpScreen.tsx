import { GoogleIcon } from "@/components/icons/GoogleIcon";
import { cancelGoogleSignUp, completeGoogleSignUp } from "@/app/actions/auth";
import { AuthStepLayout, authTextLinkClass } from "./AuthStepLayout";
import { SetPasswordForm } from "./SetPasswordForm";

type CompleteSignUpScreenProps = {
  name: string;
  email: string;
};

export function CompleteSignUpScreen({
  name,
  email,
}: CompleteSignUpScreenProps) {
  return (
    <AuthStepLayout
      title="আর একটু বাকি"
      subtitle="একটা পাসওয়ার্ড ঠিক করে নাও। তাহলে পরে গুগল বা ইমেইল, যেভাবে খুশি ঢুকতে পারবে।"
    >
      <div className="bg-field border-line rounded-field flex items-center gap-3 border-[1.5px] px-[15px] py-[13px]">
        <GoogleIcon className="h-5 w-5 flex-none" />
        <div className="min-w-0">
          <p className="truncate text-[16px] font-semibold">{name}</p>
          <p className="text-ink-muted truncate text-[14px]">{email}</p>
        </div>
      </div>

      <SetPasswordForm
        email={email}
        cta="সাইন ইন"
        action={completeGoogleSignUp}
      />

      <form action={cancelGoogleSignUp} className="flex justify-center">
        <button type="submit" className={authTextLinkClass}>
          বাতিল করো
        </button>
      </form>
    </AuthStepLayout>
  );
}
