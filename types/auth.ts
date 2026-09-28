export type AuthMode = "login" | "signup";

export type AuthActionResult = { error?: string };

export type {
  SignInValues,
  SignUpValues,
  SetPasswordValues,
  ChangePasswordValues,
  ForgotPasswordValues,
  ResetCodeValues,
} from "@/lib/validation/auth";
