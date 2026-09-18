import { Logo } from "@/components/icons/Logo";
import { GoogleIcon } from "@/components/icons/GoogleIcon";
import { cancelGoogleSignUp } from "@/app/actions/auth";
import { AuthCard } from "./AuthCard";
import { AuthPanel } from "./AuthPanel";
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
    <main className="flex flex-1 items-center justify-center px-[18px] py-7">
      <AuthCard>
        <AuthPanel />

        <div className="flex flex-col gap-5 px-[22px] py-8 sm:px-[34px] md:pt-10 md:pb-9">
          <Logo className="md:hidden" />

          <div>
            <h1 className="font-display text-[23px] font-bold">
              আর একটু বাকি
            </h1>
            <p className="text-ink-muted mt-[3px] text-[15px]">
              একটা পাসওয়ার্ড ঠিক করে নাও। তাহলে পরে গুগল বা ইমেইল, যেভাবে খুশি
              ঢুকতে পারবে।
            </p>
          </div>

          <div className="bg-field border-line rounded-field flex items-center gap-3 border-[1.5px] px-[15px] py-[13px]">
            <GoogleIcon className="h-5 w-5 flex-none" />
            <div className="min-w-0">
              <p className="truncate text-[16px] font-semibold">{name}</p>
              <p className="text-ink-muted truncate text-[14px]">{email}</p>
            </div>
          </div>

          <SetPasswordForm email={email} />

          <form action={cancelGoogleSignUp} className="flex justify-center">
            <button
              type="submit"
              className="text-ink-muted hover:text-ink focus-visible:outline-primary cursor-pointer rounded-sm text-[15px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              বাতিল করো
            </button>
          </form>
        </div>
      </AuthCard>
    </main>
  );
}
